const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const uri = "mongodb+srv://DerpNerd:KSvw9xj7J6zXVV2p@fblabizbond.xgvbq7z.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); 
});

app.post('/submit-partner-info', async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("FBLABizbond").collection("partners"); 
    await collection.insertOne(req.body);
    res.send("Partner information saved successfully");
  } catch (err) {
    console.error(err);
    res.send("Error saving data");
  } finally {
    await client.close();
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
