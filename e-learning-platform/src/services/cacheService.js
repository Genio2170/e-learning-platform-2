const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  url: process.env.REDIS_URL
});

const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client);

module.exports = {
  getCourse: async (courseId) => {
    const cached = await getAsync(`course:${courseId}`);
    if (cached) return JSON.parse(cached);

    const course = await Course.findById(courseId)
      .populate('teacher')
      .lean();

    await setexAsync(`course:${courseId}`, 3600, JSON.stringify(course)); // 1h cache

    return course;
  },

  invalidateCourse: async (courseId) => {
    await client.del(`course:${courseId}`);
  }
};


const hierarchicalCache = {
  set: async (key, data, ttl = 3600) => {
    await setexAsync(key, ttl, JSON.stringify(data));
    await setexAsync(`keys:${key}`, ttl * 2, 
      JSON.stringify(getDependenciesKeys(data)));
  },

  getDependencies: (data) => {
    // Ex: Se cache é de curso, dependências podem ser:
    return [
      `user:${data.teacherId}`,
      `reviews:${data._id}`
    ];
  }
};
