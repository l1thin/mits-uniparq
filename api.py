from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np
import easyocr
import re

app = FastAPI()

# Load trained YOLO model
model = YOLO("runs/detect/train/weights/best.pt")  # change path if train2/train3

# Load OCR model
reader = easyocr.Reader(['en'])


# -------- Clean Plate Function --------
def clean_plate(text):
    text = text.upper()
    text = text.replace(" ", "")
    text = text.replace("IND", "")  # remove blue region text

    # remove non-alphanumeric characters
    text = re.sub(r'[^A-Z0-9]', '', text)

    # match Indian format (2 letters + 2 digits + 4 digits)
    match = re.search(r'[A-Z]{2}\d{2}\d{4}', text)

    if match:
        return match.group(0)

    return text


# -------- Detect Endpoint --------
@app.post("/detect")
async def detect_plate(file: UploadFile = File(...)):

    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model(img, conf=0.25)

    for r in results:
        for box in r.boxes.xyxy:
            x1, y1, x2, y2 = map(int, box)

            # Add padding
            pad = 20
            x1 = max(0, x1 - pad)
            y1 = max(0, y1 - pad)
            x2 = min(img.shape[1], x2 + pad)
            y2 = min(img.shape[0], y2 + pad)

            plate_crop = img[y1:y2, x1:x2]

            # Resize for better OCR
            plate_crop = cv2.resize(
                plate_crop, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC
            )

            # Convert to grayscale
            gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)

            # Noise reduction
            gray = cv2.bilateralFilter(gray, 11, 17, 17)

            # Thresholding
            _, thresh = cv2.threshold(
                gray, 150, 255, cv2.THRESH_BINARY
            )

            # OCR
            ocr_result = reader.readtext(thresh, detail=0)

            if ocr_result:
                full_text = "".join(ocr_result)
                plate_number = clean_plate(full_text)

                return {
                    "plate_number": plate_number,
                    "raw_text": full_text
                }

    return {"plate_number": None}
