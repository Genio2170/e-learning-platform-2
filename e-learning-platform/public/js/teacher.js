// Criar curso
document.getElementById('create-course-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const response = await fetch('/teacher/courses', {
    method: 'POST',
    headers: {
'Content-Type': 'application/json'
    },
    body: JSON.stringify(Object.fromEntries(formData))
  });

  if (response.ok) {
    alert('Course created successfully!');
    window.location.reload();
  }
});

// Adicionar aula
window.addLesson = async (courseId) => {
  const lessonContent = prompt('Enter lesson content:');
  if (lessonContent) {
    const response = await fetch(`/teacher/courses/${courseId}/lessons`, {
      method: 'POST',
      headers: {
'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Lesson ${new Date().toLocaleDateString()}`,
        content: lessonContent
      })
    });

    if (response.ok) {
      alert('Lesson added!');
      window.location.reload();
    }
  }
};
