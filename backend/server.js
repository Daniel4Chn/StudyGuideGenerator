const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Helper function to truncate text if too long
function truncateText(text, maxLength = 10000) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '... [truncated]';
}

// Helper function to generate study guide using OpenAI
async function generateStudyGuide(text) {
  const truncatedText = truncateText(text);

  const prompt = `You are an expert study guide generator. Convert the following lecture notes into a comprehensive study guide.

LECTURE NOTES:
${truncatedText}

Generate a structured study guide with the following sections:

1. KEY CONCEPTS: List the most important concepts as bullet points (5-10 concepts)
2. EXPLANATIONS: Provide short, clear explanations for each key concept (2-3 sentences each)
3. PRACTICE QUESTIONS: Create 5-8 practice questions with concise answers (questions should test understanding of the material)
4. CHEAT SHEET: A condensed summary with the most critical information in a quick-reference format

Format your response as valid JSON with this exact structure:
{
  "keyConcepts": ["concept1", "concept2", ...],
  "explanations": {
    "concept1": "explanation text",
    "concept2": "explanation text",
    ...
  },
  "practiceQuestions": [
    {
      "question": "question text",
      "answer": "answer text"
    },
    ...
  ],
  "cheatSheet": "condensed summary text"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates structured study guides from lecture notes. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content.trim();
    
    // Try to parse JSON from the response
    // Sometimes the model wraps JSON in markdown code blocks
    let jsonText = responseText;
    if (responseText.startsWith('```json')) {
      jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (responseText.startsWith('```')) {
      jsonText = responseText.replace(/```\n?/g, '').trim();
    }

    const studyGuide = JSON.parse(jsonText);
    return studyGuide;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate study guide. Please check your API key and try again.');
  }
}

// POST /generate endpoint
app.post('/generate', async (req, res) => {
  try {
    let lectureText = '';

    // Check if text is provided directly in request body
    if (req.body.text) {
      lectureText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No text provided. Please paste text or upload a PDF.' });
    }

    if (!lectureText.trim()) {
      return res.status(400).json({ error: 'Text cannot be empty.' });
    }

    // Generate study guide
    const studyGuide = await generateStudyGuide(lectureText);

    res.json(studyGuide);
  } catch (error) {
    console.error('Error generating study guide:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study guide' });
  }
});

// POST /upload endpoint for PDF uploads
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const lectureText = pdfData.text;

    if (!lectureText.trim()) {
      return res.status(400).json({ error: 'PDF appears to be empty or could not extract text' });
    }

    // Generate study guide
    const studyGuide = await generateStudyGuide(lectureText);

    res.json(studyGuide);
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ error: error.message || 'Failed to process PDF' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

