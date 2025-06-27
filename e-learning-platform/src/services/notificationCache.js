const redis = require('redis');
const client = redis.createClient();

async function cacheUserPreferences(userId) {
  const prefs = await UserPreferences.findOne({ userId }).lean();
  await client.setEx(
    `prefs:${userId}`,
    3600, // 1 hora
    JSON.stringify(prefs)
  );
  return prefs;
}

async function getCachedPreferences(userId) {
  const cached = await client.get(`prefs:${userId}`);
  return cached ? JSON.parse(cached) : cacheUserPreferences(userId);
}
