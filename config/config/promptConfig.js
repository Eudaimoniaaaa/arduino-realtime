function deepSeekPrompt(data) {
  const { temperature, lux, soilHumidity } = data;

  return `
请基于以下植物传感器数据提供分析：
温度：${temperature}°C
光照：${lux} lux
土壤湿度：${soilHumidity}

要求：
1. 用简洁自然语言判断当前环境是否适合植物生长。
2. 参考植物生理学、生物学等相关文献，输出2-3条引用建议（列出作者、标题与出版信息即可）。
3. 如果有建议的改进措施，请使用列表说明。
4. 语言简洁，不使用 Markdown、标题、符号等装饰格式。
`;
}

module.exports = { deepSeekPrompt };
