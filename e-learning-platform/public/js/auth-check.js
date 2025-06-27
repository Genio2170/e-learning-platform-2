// public/js/auth-check.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar elementos protegidos
  const protectedElements = document.querySelectorAll('[data-protected]');
  
  if (protectedElements.length > 0) {
    // Fazer requisição para verificar autenticação
    fetch('/api/auth/check')
      .then(response => response.json())
      .then(data => {
        if (!data.authenticated) {
          protectedElements.forEach(element => {
            // Substituir por conteúdo para não autenticados
            element.innerHTML = `
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <h3 class="text-lg font-medium text-blue-800">Conteúdo Exclusivo</h3>
                <p class="mt-2 text-blue-700">Faça login para acessar este conteúdo</p>
                <div class="mt-4">
                  <a href="/auth/login" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Fazer Login
                  </a>
                  <a href="/auth/register" class="ml-2 text-blue-600 hover:text-blue-800">
                    ou Cadastre-se
                  </a>
                </div>
              </div>
            `;
          });
        } else {
          // Carregar conteúdo protegido dinamicamente
          loadProtectedContent();
        }
      })
      .catch(() => {
        // Tratar erro
        protectedElements.forEach(element => {
          element.innerHTML = '<p class="text-red-500">Erro ao verificar autenticação</p>';
        });
      });
  }
});

function loadProtectedContent() {
  // Carregar cursos em destaque, etc.
  const protectedSections = document.querySelectorAll('[data-protected-content]');
  
  protectedSections.forEach(section => {
    const endpoint = section.dataset.protectedContent;
    
    fetch(`/api${endpoint}`)
      .then(response => response.json())
      .then(data => {
        // Preencher seção com dados
        if (data.courses) {
          section.innerHTML = renderCourses(data.courses);
        }
      });
  });
}


document.addEventListener('DOMContentLoaded', () => {
  // Validação de telefone (Angola)
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value
        .replace(/\D/g, '')
        .replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, '+244 $1 $2 $3');
    });
  }

  // Validação de BI (Angola)
  const idInput = document.getElementById('idNumber');
  if (idInput) {
    idInput.addEventListener('input', (e) => {
      e.target.value = e.target.value
        .replace(/\D/g, '')
        .replace(/^(\d{3})(\d{5})(\d{2})(\d{1})$/, '$1.$2.$3.$4');
    });
  }
});
