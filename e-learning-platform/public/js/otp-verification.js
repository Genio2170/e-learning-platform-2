document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('otpForm');
  const inputs = form.querySelectorAll('input[type="text"]');
  const resendBtn = document.getElementById('resendBtn');
  const email = document.getElementById('email').value;

  // Auto-focus e navegação entre campos
  inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      if (input.value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && index > 0 && !input.value) {
        inputs[index - 1].focus();
      }
    });
  });

  // Submissão do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = Array.from(inputs).map(i => i.value).join('');

    try {
      const response = await fetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/auth/register?verified=true';
      } else {
        alert(data.error || 'Código inválido');
      }
    } catch (err) {
      console.error(err);
      alert('Erro na verificação');
    }
  });

  // Reenviar OTP
  resendBtn.addEventListener('click', async () => {
    try {
      await fetch('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      alert('Novo código enviado!');
    } catch (err) {
      alert('Falha ao reenviar');
    }
  });
});

