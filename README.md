# Lecture Notes to Study Guide

A minimal web application that transforms lecture notes into structured study guides using AI.

## Features

- Upload PDF files or paste raw text
- Automatic text extraction from PDFs
- AI-powered study guide generation with:
  - Key concepts (bullet points)
  - Short explanations for each concept
  - 5-8 practice questions with answers
  - Condensed cheat sheet

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **PDF Parsing**: pdf-parse
- **AI**: OpenAI API (GPT-4o-mini)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

Start the backend server:

```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

Open a new terminal window:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### 3. Usage

1. Either upload a PDF file or paste your lecture notes in the text area
2. Click "Generate Study Guide"
3. Wait for the AI to process your notes (this may take 10-30 seconds)
4. Review your generated study guide with all sections

## API Endpoints

### POST `/generate`
Generate study guide from text input.

**Request Body:**
```json
{
  "text": "Your lecture notes here..."
}
```

**Response:**
```json
{
  "keyConcepts": ["concept1", "concept2", ...],
  "explanations": {
    "concept1": "explanation text",
    "concept2": "explanation text"
  },
  "practiceQuestions": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ],
  "cheatSheet": "Condensed summary text"
}
```

### POST `/upload`
Generate study guide from PDF upload.

**Request:** Multipart form data with `pdf` field

**Response:** Same as `/generate`

## Project Structure

```
StudyGuide/
├── backend/
│   ├── server.js          # Express server with API endpoints
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Tailwind imports
│   ├── public/
│   │   └── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## LLM Prompt

The app uses the following prompt structure for generating study guides:

```
You are an expert study guide generator. Convert the following lecture notes into a comprehensive study guide.

[LECTURE NOTES CONTENT]

Generate a structured study guide with:
1. KEY CONCEPTS: List the most important concepts as bullet points (5-10 concepts)
2. EXPLANATIONS: Provide short, clear explanations for each key concept (2-3 sentences each)
3. PRACTICE QUESTIONS: Create 5-8 practice questions with concise answers
4. CHEAT SHEET: A condensed summary with the most critical information

Format your response as valid JSON with the specified structure.
```

## Notes

- Text input is truncated to 10,000 characters to manage API costs and response times
- PDF files are limited to 10MB
- No authentication or database - all processing is stateless
- The app uses GPT-4o-mini for cost efficiency

## Troubleshooting

- **"Failed to generate study guide"**: Check that your OpenAI API key is set correctly in the `.env` file
- **CORS errors**: Ensure the backend is running on port 3001
- **PDF extraction fails**: Ensure the PDF contains extractable text (not just images)

>>>>>>> 1556522 (Pushing Lecutre Notes to Study Guide on Github)
