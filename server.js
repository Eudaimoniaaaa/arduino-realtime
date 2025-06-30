const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");
const { deepSeekPrompt } = require("./config/config/promptConfig"); // 引入提示词配置
const askDeepSeek = require("./ask-server");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let latestSensorData = null;

app.get("/api/data", (req, res) => {
  res.json({ sensorData: latestSensorData });
});

app.post("/api/data", (req, res) => {
  const sensorData = req.body;
  latestSensorData = sensorData;
  console.log("📡 Received sensor data:", sensorData);

  io.emit("sensor-data", sensorData);

  analyzeDataWithDeepSeek(sensorData);

  res.status(200).json({ message: "Data received" });
});

function analyzeDataWithDeepSeek(data) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  const requestData = {
    model: "deepseek-chat",
    messages: [
      {
        role: "user",
        content: deepSeekPrompt(data) // 使用配置模块中的提示词
      }
    ],
    temperature: 0.5
  };

  const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });

axios
  .post("https://api.deepseek.com/v1/chat/completions", requestData, { headers, httpsAgent: agent })
    .then(response => {
      const result = response.data.choices[0].message.content;
      console.log("💡 DeepSeek 分析结果:\n", result);
      io.emit("deepseek-analysis", result);
    })
    .catch(error => {
      console.error("❌ DeepSeek 请求失败:", error.response?.data || error.message);
    });
}

app.post("/ask", async (req, res) => {
  const { question, sensorData } = req.body;
  if (!question || !sensorData) {
    return res.status(400).json({ error: "缺少 question 或 sensorData" });
  }

  try {
    const answer = await askDeepSeek({ question, sensorData });
    res.json({ answer });
  } catch (error) {
    console.error("❌ DeepSeek 调用失败:", error.message);
    res.status(500).json({ error: "DeepSeek 调用失败" });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
