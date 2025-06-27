module.exports = {
  // Autenticação
  ensureAuthenticated: require('./auth/ensureAuthenticated'),
  ensureRole: require('./auth/ensureRole'),
  ensureProfileComplete: require('./auth/ensureProfileComplete'),
  redirectIfAuthenticated: require('./auth/redirectIfAuthenticated'),
  
  // Segurança
  rateLimiter: require('./security/rateLimiter'),
  csrfProtection: require('./security/csrfProtection'),
  cors: require('./security/cors'),
  
  // Contexto
  setUserLocals: require('./context/setUserLocals'),
  setCurrentPage: require('./context/setCurrentPage'),
  
  // Erros
  notFoundHandler: require('./errorHandlers/notFoundHandler'),
  errorHandler: require('./errorHandlers/errorHandler')
};



// Middleware para verificar conquistas
userSchema.post('save', async function(doc) {
  const achievements = await Achievement.find();
  
  for (const achievement of achievements) {
    const hasAchievement = await UserAchievement.exists({ 
      user: doc._id, 
      achievement: achievement._id 
    });
    
    if (!hasAchievement) {
      let meetsCriteria = false;
      
      switch (achievement.criteria.type) {
        case 'coursesCompleted':
          meetsCriteria = doc.coursesEnrolled.length >= achievement.criteria.threshold;
          break;
        case 'lessonsCompleted':
          // Lógica para verificar lições completas
          break;
        // Outros casos...
      }
      
      if (meetsCriteria) {
        await UserAchievement.create({
          user: doc._id,
          achievement: achievement._id
        });
        
        // Enviar notificação
        await Notification.createAndSend(
          doc._id,
          'Nova Conquista!',
          `Você desbloqueou a conquista "${achievement.name}"`,
          'achievement',
          achievement._id,
          req.io
        );
      }
    }
  }
});


// Middleware para definir linguagem
app.use((req, res, next) => {
  const lang = req.cookies.lang || req.acceptsLanguages(i18n.getLocales()) || 'pt';
  req.setLocale(lang);
  res.locals.__ = res.__ = function() { return i18n.__.apply(req, arguments) };
  next();
});// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

