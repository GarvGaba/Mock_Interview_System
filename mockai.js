const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"]
  }
});

const port = 3009;

const genAI = new GoogleGenerativeAI("AIzaSyCXn4H0ndGdyD6dZYxyPvG8b_2pd6kYYIo");
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect('mongodb://localhost:27017/mock_interviewssss', { useNewUrlParser: true, useUnifiedTopology: true });

const ResponseSchema = new mongoose.Schema({
    question: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
});

const Response = mongoose.model('Response', ResponseSchema);

const upload = multer({ dest: 'uploads/' });

app.post('/uploadResume', upload.single('resume'), async (req, res) => {
    console.log("Received upload request");
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log("Processing file:", req.file.path);
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdf(dataBuffer);
        const resumeText = pdfData.text;

        console.log("Generating questions from resume text");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Based on the following resume, generate 5 interview questions:\n\n${resumeText}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const questions = response.text().split('\n').filter(q => q.trim() !== '');

        res.json({ questions });

        fs.unlinkSync(req.file.path);
    } catch (error) {
        console.error("Error processing resume:", error);
        res.status(500).json({ error: 'Error processing resume: ' + error.message });
    }
});

app.post('/saveResponse', async (req, res) => {
    const { question, response } = req.body;
    try {
        const newResponse = new Response({
            question,
            response
        });
        await newResponse.save();
        res.json({ message: 'Response saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving response to database' });
    }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('audioData', (data) => {
    // Here you would process the audio data and convert it to text
    // For now, we'll just echo it back
    socket.emit('transcription', "This is a mock transcription. Implement actual speech-to-text here.");
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use((req, res) => {
    console.log('Received request for:', req.url);
    res.status(404).send('Not Found');
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

