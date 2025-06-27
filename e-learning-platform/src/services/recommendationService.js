// services/recommendationService.js
const tf = require('@tensorflow/tfjs-node');
const User = require('../models/User');
const Course = require('../models/Course');

class RecommendationEngine {
  constructor() {
    this.model = null;
    this.userFeatures = {};
    this.courseFeatures = {};
  }

  async initialize() {
    // Carregar dados e treinar modelo
    await this.loadData();
    this.trainModel();
  }

  async loadData() {
    const users = await User.find().select('coursesEnrolled interests');
    const courses = await Course.find().select('category tags studentsEnrolled');
    
    // Processar features (simplificado)
    users.forEach(user => {
      this.userFeatures[user._id] = {
        enrolled: user.coursesEnrolled,
        interests: user.interests || []
      };
    });
    
    courses.forEach(course => {
      this.courseFeatures[course._id] = {
        category: course.category,
        tags: course.tags,
        popularity: course.studentsEnrolled.length
      };
    });
  }

  trainModel() {
    // Modelo simplificado para demonstração
    this.model = {
      predict: (userId) => {
        const user = this.userFeatures[userId];
        if (!user) return [];
        
        return Object.keys(this.courseFeatures)
          .filter(courseId => !user.enrolled.includes(courseId))
          .sort((a, b) => {
            // Lógica de recomendação simplificada
            const scoreA = this.calculateMatchScore(user, this.courseFeatures[a]);
            const scoreB = this.calculateMatchScore(user, this.courseFeatures[b]);
            return scoreB - scoreA;
          })
          .slice(0, 5);
      },
      calculateMatchScore: (user, course) => {
        let score = 0;
        if (user.interests.includes(course.category)) score += 2;
        if (user.interests.some(interest => course.tags.includes(interest))) score += 1;
        score += course.popularity * 0.001;
        return score;
      }
    };
  }

  getRecommendations(userId) {
    if (!this.model) return [];
    return this.model.predict(userId);
  }
}

module.exports = new RecommendationEngine();
