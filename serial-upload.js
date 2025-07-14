const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const axios = require("axios");
const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });

const port = new SerialPort({
  path: "/dev/cu.usbserial-14330",
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

parser.on("data", async (line) => {
  if (!line.trim().startsWith("{")) return;

  try {
    const sensorData = JSON.parse(line.trim());
    console.log("📦 Arduino 数据:", sensorData);

    await axios.post(
      "https://arduino-realtime.onrender.com/api/data",
      sensorData,
      { httpsAgent: agent }
    );
  } catch (err) {
    console.error("❌ 数据处理错误:", err.message);
  }
});
