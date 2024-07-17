const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('publiic'));

const aiPatterns = [
  "As an AI language model",
  "I am an AI assistant",
  "I do not have personal experiences",
  "I don't have access to real-time information",
  "I'm a large language model",
  "As a language model",
  "I don't have personal opinions",
  "I don't have access to current events",
  "I'm not able to browse the internet",
  "I don't have real-time information",
];

function checkForAIPatterns(text) {
  const lowercaseText = text.toLowerCase();
  const foundPatterns = aiPatterns.filter(pattern =>
    lowercaseText.includes(pattern.toLowerCase())
  );
  return foundPatterns;
}

async function analyzePDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    const text = data.text;

    console.log(`PDF text: ${text}`);

    const foundPatterns = checkForAIPatterns(text);

    if (foundPatterns.length > 0) {
      return {
        message: "This resume appears to contain AI-generated content.",
        patterns: foundPatterns
      };
    } else {
      return {
        message: "This resume does not appear to contain AI-generated content."
      };
    }
  } catch (error) {
    console.error(`Error analyzing PDF: ${error}`);
    throw new Error(`Failed to analyze PDF: ${error.message}`);
  }
}

app.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    console.log('File uploaded:', req.file);
    const result = await analyzePDF(req.file.path);
    console.log('Analysis result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ message: 'Error analyzing resume: ' + error.message });
  } finally {
    // Clean up: delete the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'publiic', 'index.html'));
});

app.get('/checker', (req, res) => {
  res.sendFile(path.join(__dirname, 'publiic', 'checker.html'));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});