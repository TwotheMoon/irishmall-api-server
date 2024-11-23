import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('서버가동!');
});

app.post('/api', (req, res) => {
  const data = req.body;
  res.json({ message: 'Data received', receivedData: data});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});