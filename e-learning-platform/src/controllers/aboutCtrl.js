exports.getAboutPage = (req, res) => {
  // Em uma implementação real, esses dados poderiam vir do banco de dados
  const teamMembers = [
    {
      id: 1,
      name: "Carlos Kipanda",
      position: "CEO & Fundador",
      bio: "Especialista em tecnologia educacional com mais de 10 anos de experiência no setor.",
      photo: "/images/team/team-1.jpg",
      social: [
        { platform: "linkedin", url: "#" },
        { platform: "twitter", url: "#" }
      ]
    },
    // ... outros membros da equipe
  ];

  res.render('about', {
    title: 'Sobre Nós',
    teamMembers,
    user: req.user
  });
};
