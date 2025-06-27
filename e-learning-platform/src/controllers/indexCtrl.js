// Middleware para todas as rotas
app.use((req, res, next) => {
  // Determina a página atual para highlight no menu
  res.locals.currentPage = req.path.split('/')[1] || 'home';
  res.locals.user = req.user || null;
  next();
});
// No seu controller principal
app.use((req, res, next) => {
  res.locals.partners = [
    {
      name: "Portal de Educação",
      url: "https://www.parceiro1.com",
      description: "Recursos educacionais para professores"
    },
    {
      name: "Associação de Professores",
      url: "https://www.parceiro2.com",
      description: "Associação nacional de educadores"
    },
    // Adicione mais parceiros conforme necessário
  ];
  next();
});