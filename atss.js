const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const API_KEY = 'AIzaSyCXn4H0ndGdyD6dZYxyPvG8b_2pd6kYYIo';

app.use(express.static('ats'));

app.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    const dataBuffer = await pdfParse(file.path);
    const text = dataBuffer.text;

    // Here, you would typically send the text to an AI service for analysis
    // For this example, we'll use a dummy scoring function
    const score = calculateATSScore(text);

    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: 'Error processing the file' });
  }
});

function calculateATSScore(text) {
  // This is a dummy function. In a real scenario, you'd use an AI service or more complex logic
  const keywords = ['experience', 'skills', 'education', 'project'];
  let score = 0;
  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      score += 25;
    }
  });
  return Math.min(score, 100);
}

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));