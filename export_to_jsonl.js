const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./sensorData.db");

const outputFile = "./finetune_export.jsonl";
const stream = fs.createWriteStream(outputFile, { flags: "w" });

db.all("SELECT * FROM sensorData WHERE aiAnalysis IS NOT NULL", (err, rows) => {
  if (err) {
    console.error("❌ 查询失败:", err);
    return;
  }

  rows.forEach(row => {
    const prompt = `请分析以下环境数据：温度为 ${row.temperature}°C，光照为 ${row.lux} lux，土壤湿度为 ${row.soilHumidity}（原始值）。请判断植物是否处于良好状态，并给出建议。`;
    
    const jsonl = {
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: row.aiAnalysis }
      ]
    };

    stream.write(JSON.stringify(jsonl) + "\n");
  });

  stream.end(() => {
    console.log(`✅ 导出完成，共 ${rows.length} 条记录写入 ${outputFile}`);
    db.close();
  });
});
