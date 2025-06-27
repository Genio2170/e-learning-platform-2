// Deletar curso
window.deleteCourse = async (courseId) => {
  if (confirm('Are you sure you want to delete this course?')) {
    const response = await fetch(`/admin/courses/${courseId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Course deleted successfully');
      window.location.reload();
    }
  }
};
