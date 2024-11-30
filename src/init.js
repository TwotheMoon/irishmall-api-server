import "./db";
import "./models/NaverAllCate";
import "./models/MyCate";
import "./models/WhiteList";
import app from "./server"

const PORT = 4000;

const handleListening = () => {
  console.log(`Server is running on http://localhost:${PORT}`);
};

app.listen(PORT, handleListening);
