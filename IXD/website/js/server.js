const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');

const app = express();
app.use(cors());

// Serve static frontend files from the website/ root (one level up from js/)
app.use(express.static(path.join(__dirname, '..')));

// 💡 核心：内存缓存池 (In-Memory Cache)
// 结构示例： { 'yosemite_amphibians_06': [坐标数组], ... }
let gbifCache = {};

// 1. 物种分类映射 (Taxon Keys) - 需要你后续去 GBIF 查证完善
const taxonMapping = {
  'large-mammals': [732, 733], // 示例：偶蹄目、食肉目
  'small-mammals': [1459, 731, 734],
  'raptors': [7191147, 7191144, 7191145],
  'waterbirds': [7191141, 7191154, 7191149, 7191150],
  'songbirds': [7192403],
  'reptiles': [358], // 示例：爬行纲
//   'birds': [212],
  'amphibians': [131], 
  'butterflies': [797],
  'insects': [216],
  'fish': [204],
  // ... 其他 7 个分类
};

// 2. 国家公园边界盒 (Bounding Boxes) - [minLng, minLat, maxLng, maxLat]
const parkBounds = {
  'yosemite': [-119.9, 37.4, -119.1, 38.2], 
  'yellowstone': [-111.1, 44.1, -109.8, 45.1],
  'death-valley': [-117.5, 35.8, -116.2, 37.0],
  'glacier': [-114.4, 48.1, -113.1, 49.0],
  'grand-canyon': [-112.4, 35.9, -111.7, 36.4],
  'zion': [-113.2, 37.1, -112.8, 37.4]
};

app.get('/api/heatmap', async (req, res) => {
  const { park, species, month } = req.query;

  // 1. 校验前端传来的参数是否合法
  if (!parkBounds[park] || !taxonMapping[species] || !month) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  // 2. 构造独一无二的缓存 Key
  const cacheKey = `${park}_${species}_${month}`;

  // 3. 拦截：如果缓存里有，直接光速返回！
  if (gbifCache[cacheKey]) {
    console.log(`命中缓存: ${cacheKey}`);
    return res.json(gbifCache[cacheKey]);
  }

  // 4. 如果缓存没有，开始向 GBIF 请求数据的核心逻辑
  try {
    console.log(`向 GBIF 请求新数据: ${cacheKey}`);
    
    const bounds = parkBounds[park];
    const taxonKeys = taxonMapping[species];
    
    // TODO: 这里需要你写一段 fetch 逻辑，请求 GBIF 的 /occurrence/search 接口
    // 提示：你可以把 taxonKeys 数组里的 ID 拼装成多个 taxonKey=xxx 参数
    // 传入 bounds 的经纬度，以及 month

    // 1. 拼接复杂的 GBIF 查询 URL
    // parkBounds 的结构是 [minLng, minLat, maxLng, maxLat]
    const latParams = `decimalLatitude=${bounds[1]},${bounds[3]}`;
    const lngParams = `decimalLongitude=${bounds[0]},${bounds[2]}`;
    
    // 一个物种分类可能包含多个纲/目的 ID，需要用 & 符号拼接多个 taxonKey
    const taxonParams = taxonKeys.map(key => `taxonKey=${key}`).join('&');

    // 组合最终 URL (指定月份，必须有经纬度，并限制每次拉取最多 500 条以保证速度)
    const gbifUrl = `https://api.gbif.org/v1/occurrence/search?${taxonParams}&${latParams}&${lngParams}&month=${month}&hasCoordinate=true&limit=500`;
    
    console.log(`准备向 GBIF 发送请求: ${gbifUrl}`);

    // 2. 发起原生请求获取数据
    const response = await fetch(gbifUrl);
    
    if (!response.ok) {
        throw new Error(`GBIF API Error: ${response.status}`);
    }
    
    const rawData = await response.json();

    // // 3. 数据清洗与降维提取
    // // GBIF 会返回几十个毫无用处的字段，我们只提纯出经纬度，并赋予一个默认活跃度权重
    // const processedData = rawData.results.map(record => {
    //   return {
    //     lat: record.decimalLatitude,
    //     lng: record.decimalLongitude,
    //     weight: 60 // 基础视觉权重，如果数据多，热力图渲染时自然会叠加变亮
    //   };
    // });

    // 3. 数据清洗与降维提取
    const processedData = rawData.results
      // 【新增拦截器】：如果是其他昆虫，则过滤掉 orderKey 为 797（鳞翅目）的数据
      .filter(record => species === 'other-insects' ? record.orderKey !== 797 : true)
      .map(record => {
        return {
          lat: record.decimalLatitude,
          lng: record.decimalLongitude,
          weight: 60 
        };
      });

    // === 替换到此结束 ===

    // 5. 存入缓存，并返回给前端
    gbifCache[cacheKey] = processedData;
    res.json(processedData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data from GBIF" });
  }
});

// 定时任务：每月 1 号的凌晨 3 点执行
cron.schedule('0 3 1 * *', () => {
  console.log('🔄 执行月度维护：清空所有野生动物观测缓存');
  gbifCache = {}; // 直接把缓存对象重置为空
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});