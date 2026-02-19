Indian Number Plate Recognition System

An End-to-End Automatic Number Plate Recognition (ANPR) system built using Deep Learning.
This project detects Indian vehicle number plates from images and extracts the plate number using OCR. The system is deployed with a modern React frontend and Supabase backend.

🚀 Project Overview

This system performs:

🔍 Number Plate Detection using YOLOv8

🔤 Text Recognition (OCR) using EasyOCR / CRNN

🌐 Web-based Interface built with React

🗄 Cloud Database using Supabase

Example Output:

Input Image → car.jpg
Detected Plate → KL07AB1234
Stored in Supabase Database

🧠 System Architecture

Vehicle Image
↓
YOLOv8 (Detect Plate)
↓
Crop Plate Region
↓
OCR Model (Extract Text)
↓
Backend API
↓
Supabase Database
↓
React Frontend Display

🛠 Tech Stack
🔹 Frontend

React.js

Axios

Tailwind / CSS

🔹 Backend

Python (Flask / FastAPI)

Ultralytics YOLOv8

EasyOCR

🔹 Database

Supabase (PostgreSQL)

🔹 Other Tools

OpenCV

PyTorch

Albumentations

📂 Project Structure

indian-number-plate-recognition/
│
├── frontend/ (React App)
├── backend/ (Detection + OCR API)
├── dataset/
├── models/
├── requirements.txt
└── README.md

⚙️ Installation
Clone the repository

git clone https://github.com/your-username/indian-number-plate-recognition.git

cd indian-number-plate-recognition

Backend Setup

cd backend
pip install -r requirements.txt
python app.py

Frontend Setup

cd frontend
npm install
npm start

🗄 Supabase Integration

Stores detected plate numbers

Stores image reference

Stores timestamp of detection

Enables real-time updates

Example Table Schema:

id (uuid)
plate_number (text)
image_url (text)
detected_at (timestamp)

📊 Evaluation Metrics

Detection:

mAP@0.5

OCR:

Character Accuracy

Word Accuracy

End-to-End:

Full Plate Accuracy

🔥 Features

Modern React dashboard

Real-time plate detection

Cloud database storage

Clean API architecture

Scalable design

🚀 Future Improvements

Real-time CCTV feed support

Transformer-based OCR

Role-based authentication

Analytics dashboard

Smart parking system integration

👥 Collaborators

Mushab Mahin

Abhijith PM

Adarsh M Nair

Lithin Jose

Anirudh RV

👨‍💻 Developed By

Team – AI & DS Dept.
