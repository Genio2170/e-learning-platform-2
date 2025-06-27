module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).render('errors/500', {
    title: 'Erro no Servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};