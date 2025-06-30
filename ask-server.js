// ask-server.js
const axios = require("axios");
const config = require("./config/config/promptConfig");

async function askDeepSeek({ question, sensorData }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  let contextPrompt;

  if (config.promptMode === "simple") {
    contextPrompt = `你是一位植物助手。环境温度：${sensorData.temperature}°C，光照：${sensorData.lux} lux，土壤湿度：${sensorData.soilHumidity}。用简洁语言（100字内）判断是否适宜植物生长，并给建议。`;
  } else {
    contextPrompt = `请基于植物生态学知识，详细分析如下环境是否适合植物生长，并提出具体优化建议。环境数据如下：
温度：${sensorData.temperature}°C
光照：${sensorData.lux} lux
土壤湿度：${sensorData.soilHumidity}`;
  }

  const messages = [
    { role: "system", content: "你是一个智能植物环境分析专家。" },
    { role: "user", content: `${contextPrompt}\n用户提问：${question}` },
  ];

  const response = await axios.post(
    "https://api.deepseek.com/v1/chat/completions",
    {
      model: "deepseek-chat",
      messages,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    answer: response.data.choices[0].message.content,
  };
}

module.exports = askDeepSeek;
