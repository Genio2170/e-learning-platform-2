

// Rota para alterar idioma
app.get('/change-lang/:lang', (req, res) => {
  res.cookie('lang', req.params.lang, { maxAge: 900000, httpOnly: true });
  res.redirect('back');
});

module.exports = router;