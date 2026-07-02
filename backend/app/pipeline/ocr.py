"""
ocr.py
-------
PaddleOCR wrapper — mirrors run_ocr_on_boxes() from ocr_groq_utils.py,
adapted to work with in-memory NumPy arrays (no temp files written to disk).
"""

import cv2
import numpy as np

try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None


class IngredientOCR:
    """
    Handles OCR on YOLO-detected ingredient regions.
    Mirrors load_ocr_engine() + run_ocr_on_boxes() from ocr_groq_utils.py.
    """

    def __init__(self):
        self.ocr = None
        if PaddleOCR is None:
            print("⚠️ PaddleOCR runtime is unavailable; OCR will be skipped.")
            return

        print("📦 Loading PaddleOCR...")
        try:
            # Mirrors: load_ocr_engine(lang='en', use_angle_cls=True) from ocr_groq_utils.py
            self.ocr = PaddleOCR(lang="en", use_angle_cls=True, show_log=False)
            print("📦 PaddleOCR Loaded!")
        except Exception as exc:
            print(f"⚠️ PaddleOCR failed to initialize: {exc}")
            self.ocr = None

    def extract_text(self, image_input, boxes):
        """
        Run PaddleOCR on each YOLO box crop.

        Mirrors run_ocr_on_boxes() from ocr_groq_utils.py — same output
        format: list of {box_id, bbox, text}.

        Parameters
        ----------
        image_input : np.ndarray
            Full image as a BGR NumPy array (from cv2.imdecode).
        boxes : list[list[float]]
            YOLO xyxy box coordinates.

        Returns
        -------
        list[dict]
            One entry per box: {"box_id": int, "bbox": [x1, y1, x2, y2], "text": str}
        """
        if isinstance(image_input, np.ndarray):
            img = image_input
        else:
            img = cv2.imread(str(image_input))

        if img is None:
            return []

        h, w = img.shape[:2]
        output = []

        for i, box in enumerate(boxes):
            x1, y1, x2, y2 = map(int, box)

            # Clamp coordinates to image boundaries
            x1 = max(0, min(x1, w - 1))
            y1 = max(0, min(y1, h - 1))
            x2 = max(0, min(x2, w))
            y2 = max(0, min(y2, h))

            # Skip empty or invalid crops
            if (x2 <= x1) or (y2 <= y1):
                continue

            crop = img[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            text = ""
            if self.ocr is not None:
                ocr_result = self.ocr.ocr(crop)
                if ocr_result and ocr_result[0]:
                    text = " ".join(line[1][0] for line in ocr_result[0])

            output.append({"box_id": i, "bbox": [x1, y1, x2, y2], "text": text})

        return output
