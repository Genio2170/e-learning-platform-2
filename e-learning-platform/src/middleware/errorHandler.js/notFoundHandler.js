module.exports = (req, res, next) => {
  res.status(404).render('errors/404', {
    title: 'Página Não Encontrada'
  });
};