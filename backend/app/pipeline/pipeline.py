"""
pipeline.py
-----------
Orchestrates the full ingredient-extraction pipeline.

Mirrors the main_pipeline_notebook flow:
  1. YOLO detect          (detector.py  — IngredientDetector)
  2. PaddleOCR on boxes   (ocr.py       — IngredientOCR / run_ocr_on_boxes)
  3. Groq: find region    (postprocessor — find_ingredient_region)
  4. Draw single bbox     (OpenCV, server-side, encoded as base64)
  5. Groq: parse list     (postprocessor — structure_ingredients)
"""

import base64
import cv2
import torch  # Critical: Import torch first on Windows to resolve DLL loading conflicts with paddlepaddle
import numpy as np

from app.pipeline.detector import IngredientDetector
from app.pipeline.ocr import IngredientOCR
from app.pipeline.postprocessor import IngredientPostProcessor


class IngredientPipeline:

    def __init__(self):
        self.detector = IngredientDetector()
        self.ocr = IngredientOCR()
        self.post_processor = IngredientPostProcessor()

        print("✅ Ingredient Pipeline Initialized with YOLO + PaddleOCR + GroqLLM")

    def process_image(self, image_input: np.ndarray, conf: float = 0.45):
        """
        Run the full pipeline on an in-memory BGR image array.

        Mirrors the notebook flow:
          model(IMAGE_PATH) → get_ingredient_bbox() → draw_ingredient_box()

        Returns
        -------
        dict
            {
              "ingredient_box": {"box_id": int, "bbox": [x1,y1,x2,y2]},
              "annotated_image_base64": str,
              "extracted_text": str,
              "ingredients_json": list[str]
            }
        """
        # Step 1 — YOLO detection (mirrors: model(IMAGE_PATH, conf=0.75, iou=0.2))
        detections = self.detector.detect(image_input, conf=conf)

        # Step 2 — PaddleOCR on every detected box (mirrors: run_ocr_on_boxes)
        ocr_results = self.ocr.extract_text(image_input, detections["xyxy"])

        if not ocr_results:
            return {
                "ingredient_box": None,
                "annotated_image_base64": None,
                "extracted_text": "",
                "ingredients_json": []
            }

        # Step 3 — Single Groq call: find which box is the ingredients region
        #           mirrors: find_ingredient_region(ocr_output, groq_api_key)
        region = self.post_processor.find_ingredient_region(ocr_results)

        bbox = region.get("bbox", [])
        box_id = region.get("box_number", region.get("box_id", 0))
        # Groq may return "box_number" (1-indexed) or "box_id" — normalise to 0-indexed
        if isinstance(box_id, int) and box_id > 0 and region.get("box_number"):
            box_id = box_id - 1

        # Pull the corrected text from whatever key the model used
        extracted_text = (
            region.get("postprocessed_corrected_text")
            or region.get("text")
            or region.get("corrected_text")
            or ""
        )

        # Fallback: if bbox came back empty, use the matched OCR region's bbox
        if not bbox:
            matched = next(
                (r for r in ocr_results if r["box_id"] == box_id),
                ocr_results[0]
            )
            bbox = matched["bbox"]
            if not extracted_text:
                extracted_text = matched.get("text", "")

        # Step 4 — Draw a single bounding box server-side (mirrors: draw_ingredient_box)
        annotated = image_input.copy()
        if len(bbox) == 4:
            x1, y1, x2, y2 = map(int, bbox)
            h, w = annotated.shape[:2]
            thickness = max(2, round(w * 0.004))
            color = (0, 255, 0)  # green, matching the notebook

            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, thickness)

            label = "Ingredients"
            font_scale = max(0.5, w / 1200)
            font_thickness = max(1, thickness - 1)
            (lw, lh), baseline = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness
            )
            label_y = max(y1 - 6, lh + baseline + 4)
            cv2.rectangle(
                annotated,
                (x1, label_y - lh - baseline - 4),
                (x1 + lw + 8, label_y + 2),
                color,
                -1
            )
            cv2.putText(
                annotated, label, (x1 + 4, label_y - baseline),
                cv2.FONT_HERSHEY_SIMPLEX, font_scale,
                (0, 0, 0), font_thickness, cv2.LINE_AA
            )

        _, buf = cv2.imencode(".png", annotated)
        annotated_image_base64 = base64.b64encode(buf).decode("utf-8")

        # Step 5 — Parse the corrected text into a structured ingredient list
        ingredients_json = self.post_processor.structure_ingredients(extracted_text)

        return {
            "ingredient_box": {"box_id": box_id, "bbox": bbox},
            "annotated_image_base64": annotated_image_base64,
            "extracted_text": extracted_text,
            "ingredients_json": ingredients_json
        }
