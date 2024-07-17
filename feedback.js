const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const uri = "mongodb://localhost:27017";
const dbName = "feedbacksssDB";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the database
async function connectToDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

connectToDB();

// Route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
  /*
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'servce.html'));
});
*/

app.post('/api/feedback', async (req, res) => {
  console.log("Received feedback:", req.body);
  try {
    const database = client.db(dbName);
    const feedbacks = database.collection("feedbacks");
    const result = await feedbacks.insertOne(req.body);
    console.log("Feedback stored successfully:", result.insertedId);
    res.status(201).json({ message: "Feedback stored successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.status(500).json({ message: "Error storing feedback" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});