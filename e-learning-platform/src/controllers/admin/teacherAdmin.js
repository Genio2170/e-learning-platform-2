// Registrar novo professor (formulário especial)
exports.registerTeacherForm = (req, res) => {
  res.render('admin/teachers/register');
};
	
// Processar registro
exports.registerTeacher = async (req, res) => {
  const { email, name, expertise } = req.body;

  const teacher = new User({
    role: 'teacher',
    name,
    email,
    teacherProfile: { expertise: expertise.split(',') },
    approved: true // Aprovado automaticamente
  });

  await teacher.save();
  res.redirect('/admin/teachers');
};

// Aprovar cadastros pendentes
exports.approveTeachers = async (req, res) => {
  const pendingTeachers = await User.find({ 
    role: 'teacher', 
    approved: false 
  });
  res.render('admin/teachers/approvals', { teachers: pendingTeachers });
};
