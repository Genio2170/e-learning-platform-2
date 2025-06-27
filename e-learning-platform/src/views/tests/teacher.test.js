describe('Teacher Course Flow', () => {
  let teacherToken;

  beforeAll(async () => {
    // Login como professor
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teacher@example.com',
        password: 'password123'
      });

    teacherToken = res.body.token;
  });

  it('should create a new course', async () => {
    const res = await request(app)
      .post('/api/v1/teacher/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Novo Curso',
        description: 'Descrição com mais de 50 caracteres...',
        category: 'web'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('data._id');
  });

  it('should prevent invalid course data', async () => {
    const res = await request(app)
      .post('/api/v1/teacher/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'A', // Inválido
        description: 'Curta' // Inválido
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });
});
