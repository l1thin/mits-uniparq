from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np
import easyocr
import re

app = FastAPI()

# Load YOLO model
model = YOLO("C:\\Users\\adars\\Desktop\\mits-uniparq\\best.pt")

# Load OCR
reader = easyocr.Reader(['en'], gpu=False)


# -------- DETECT ENDPOINT --------
@app.post("/detect")
async def detect_plate(file: UploadFile = File(...)):

    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model(img, conf=0.25)

    for r in results:
        for box in r.boxes.xyxy:
            x1, y1, x2, y2 = map(int, box)

            # Dynamic padding
            h, w = img.shape[:2]
            bw = x2 - x1
            bh = y2 - y1

            pad_x = int(bw * 0.25)
            pad_y = int(bh * 0.25)

            x1 = max(0, x1 - pad_x)
            y1 = max(0, y1 - pad_y)
            x2 = min(w, x2 + pad_x)
            y2 = min(h, y2 + pad_y)

            plate_crop = img[y1:y2, x1:x2]

            # Resize to stable resolution
            plate_crop = cv2.resize(plate_crop, (800, 300))

            # Convert to grayscale
            gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)

            # Contrast enhancement (very important)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)

            # Light blur to remove texture noise
            gray = cv2.GaussianBlur(gray, (3, 3), 0)

            # OCR WITHOUT thresholding
            ocr_result = reader.readtext(
                gray,
                allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                detail=0
            )

            if ocr_result:
                full_text = "".join(ocr_result)
                full_text = full_text.replace("IND", "")

                return {
                    "raw_text": full_text
                }

    return {"raw_text": ""}
