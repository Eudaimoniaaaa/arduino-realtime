const sqlite3 = require('sqlite3').verbose();

// 打开 SQLite 数据库（或者创建它）
const db = new sqlite3.Database('./sensorData.db', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
  }
});

// 插入数据函数
const insertData = (data) => {
  const { temperature, lightRaw, lux, soilHumidity, aiAnalysis } = data;
  const query = `INSERT INTO sensorData (temperature, lightRaw, lux, soilHumidity, aiAnalysis) 
                 VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [temperature, lightRaw, lux, soilHumidity, aiAnalysis], function(err) {
    if (err) {
      console.error('插入数据时出错:', err.message);
    } else {
      console.log('数据插入成功，插入ID:', this.lastID);
    }
  });
};

// 获取最新的数据
const getLatestData = (callback) => {
  db.all('SELECT * FROM sensorData ORDER BY id DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('获取历史数据失败:', err.message);
    } else {
      callback(rows);
    }
  });
};

module.exports = { insertData, getLatestData };
