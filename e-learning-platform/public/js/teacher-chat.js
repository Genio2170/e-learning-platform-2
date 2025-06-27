document.addEventListener('DOMContentLoaded', () => {
  const messageForm = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');
  const sendBtn = messageForm.querySelector('button');
  const messagesContainer = document.getElementById('messages-container');
  
  let currentStudentId = null;

  // Selecionar aluno
  document.querySelectorAll('.student-item').forEach(item => {
    item.addEventListener('click', () => {
      currentStudentId = item.dataset.studentId;
      document.getElementById('student-id').value = currentStudentId;
      document.getElementById('chat-title').textContent = 
        item.querySelector('p').textContent;
      
      // Ativar inputs
      messageInput.disabled = false;
      sendBtn.disabled = false;
      
      // Mostrar botão de encerrar
      document.getElementById('end-chat-btn').classList.remove('hidden');
      
      // Carregar mensagens (implementar fetch)
    });
  });

  // Enviar mensagem
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    
    if (content && currentStudentId) {
      // Enviar via Socket.IO
      socket.emit('sendTeacherMessage', {
        from: currentTeacherId, // ID do professor da sessão
        to: currentStudentId,
        content
      });
      
      messageInput.value = '';
    }
  });

  // Encerrar conversa
  document.getElementById('end-chat-btn').addEventListener('click', () => {
    // Implementar lógica de encerramento
  });
});

   // Em teacher-chat.js
   socket.on('collaboration_update', (data) => {
     broadcastToTeam(data.courseId, 'update', data);
   });
