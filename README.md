VedaAI — AI Assessment Extraction & Answer Mapping

VedaAI is an AI-powered assessment analysis application built for the VedaAI Hiring Assignment

The application allows a teacher to upload a question paper and a student's handwritten answer sheet. It uses AI to extract questions and answers, map answers to their corresponding questions, and visually identify the exact region of the answer sheet where each answer was written.

 Features

* 📄 Upload question papers as PDFs or images
* ✍️ Upload handwritten student answer sheets
* 🔍 AI-powered question extraction
* 📝 Handwritten answer extraction
* 🔗 Automatic question-to-answer mapping

🧠 AI Model

The application uses **Google Gemini Flash 3.5** for AI-powered extraction, answer understanding, mapping, and prediction/assessment.




Frontend

* React
* JavaScript
* HTML
* CSS

 Backend

* Python
* Django
* Django REST Framework

AI

* Google Gemini Flash 3.5

 Production

* Gunicorn
* WhiteNoise
* Render


 How It Works

  Upload

The teacher uploads:

* A question paper
* One student's handwritten answer sheet

Both PDF and image-based documents are supported.

  Question Extraction

The question paper is processed using AI to identify individual questions.


  Answer Mapping

Extracted answers are matched against the extracted questions.

The system is designed to handle:

* Answers written in order
* Answers written out of order
* Unanswered questions
* Answers that don't match a question
* Answers spanning multiple pages  
  Region Highlighting

When a teacher selects a question, the application identifies the corresponding answer and highlights its exact region on the answer sheet.

This allows the teacher to visually verify the mapping.




