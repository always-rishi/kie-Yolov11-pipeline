"""
postprocessor.py
-----------------
Groq LLM layer for the ingredient-region detection pipeline.

Logic mirrors ocr_groq_utils.py (find_ingredient_region + structure_ingredients):
  1. find_ingredient_region  — single Groq call: pick which OCR box is the
                               ingredients list and return corrected text.
  2. structure_ingredients   — second Groq call: parse the cleaned text into
                               a flat list of individual ingredients.
"""

import json
import os
import re

from groq import Groq
from dotenv import load_dotenv

load_dotenv()


class IngredientPostProcessor:
    """
    Post-processes OCR regions using Llama 3.3 on Groq to identify and
    correct the ingredients list region.
    """

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GROQ_API_KEY environment variable is missing. "
                "Please check your backend/.env configuration."
            )

        self.model_name = "llama-3.3-70b-versatile"
        self.client = Groq(api_key=self.api_key)
        print(f"✅ Groq Post-Processor Initialized with model {self.model_name}")

    # ------------------------------------------------------------------
    # Primary call — mirrors find_ingredient_region() in ocr_groq_utils.py
    # ------------------------------------------------------------------

    def find_ingredient_region(self, ocr_output: list) -> dict:
        """
        Ask Groq to identify which OCR region is the ingredients list.

        Uses the exact same prompt as ocr_groq_utils.find_ingredient_region.

        Parameters
        ----------
        ocr_output : list[dict]
            One entry per YOLO box: {"box_id": int, "bbox": [...], "text": str}

        Returns
        -------
        dict
            Parsed JSON with at least "bbox": [xmin, ymin, xmax, ymax]
            and the corrected ingredient text (key may be "text" or
            "postprocessed_corrected_text" depending on the model's choice).
        """
        prompt = f"""
You are analyzing OCR regions from a food package.

Find the OCR region that contains the ingredients list.

Return JSON only, with the box number, bbox, and the postprocessed
corrected text. No prose, no markdown fences.

OCR Regions:
{json.dumps(ocr_output, indent=2)}
"""

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )

        raw_text = response.choices[0].message.content
        # Strip any ```json ... ``` fences the model may add
        cleaned = re.sub(
            r"^```json|^```|```$", "", raw_text.strip(), flags=re.MULTILINE
        ).strip()

        return json.loads(cleaned)

    # ------------------------------------------------------------------
    # Secondary call — parse cleaned text into a structured list
    # ------------------------------------------------------------------

    def structure_ingredients(self, cleaned_text: str) -> list:
        """
        Parse corrected ingredients text into a flat JSON array.

        Returns
        -------
        list[str]
            Individual ingredient strings.
        """
        prompt = f"""
You are a food data parser.

Given the cleaned ingredients text below from a food package label,
extract each individual ingredient as a separate item.

Return JSON only: a single object with key "ingredients" whose value is
a list of strings. No prose, no markdown fences.

Ingredients text:
{cleaned_text}
"""

        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        result = json.loads(raw)
        ingredients = result.get("ingredients", [])
        return ingredients if isinstance(ingredients, list) else [str(ingredients)]
