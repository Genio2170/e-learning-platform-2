// middleware/seo.js
module.exports = function(req, res, next) {
  res.locals.seo = {
    title: 'Plataforma de Aulas Online',
    description: 'Aprenda com os melhores cursos online em nossa plataforma educacional.',
    keywords: 'cursos online, educação, aprendizado, aulas ao vivo',
    canonical: `${process.env.DOMAIN}${req.originalUrl}`,
    og: {
      title: 'Plataforma de Aulas Online',
      description: 'Aprenda com os melhores cursos online em nossa plataforma educacional.',
      type: 'website',
      url: `${process.env.DOMAIN}${req.originalUrl}`,
      image: `${process.env.DOMAIN}/images/og-image.jpg`
    }
  };
  
  next();
};