<!-- mensagem de erro de instalação das dependeências -->
{
  "name": "e-learning-platform",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "build:css": "tailwindcss build public/css/tailwindcss.css -o public/css/main.css",
    "test": "jest"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "bcryptjs": "^3.0.2",
    "ejs": "^3.1.10",
    "express": "^5.1.0",
    "express-rate-limit": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.15.2",
    "multer": "^2.0.1",
    "nodemailer": "^7.0.3",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "socket.io": "^4.8.1",
    "firebase-admin": "^11.0.0",
"ioredis": "^5.2.3",
"prom-client": "^14.0.1",
"winston": "^3.8.2",
"winston-loki": "^7.0.1",
"winston-elasticsearch": "^0.15.0",
"morgan": "^1.10.0"

  },
  "devDependencies": {
    "autoprefixer": "^10.4.21",
    "nodemon": "^3.1.10",
    "postcss": "^8.5.5",
    "tailwindcss": "^4.1.10"
  }
}

 "bcryptjs
    ejs express-rate-limit jsonwebtoken mongoose multer nodemailer passport passport-local

express 
    socket.io firebase-admin ioredis prom-client winston winston-loki winston-elasticsearch  morgan dotenv express-session connect-mongo



    stripe twilio express-flash csv-writer pdfkit speakeasy qrcode


mongoose-history
"devDependencies": {
   

1. Instalar dependências:
   ```bash	
   npm install csv-writer pdfkit

Testar em ambiente de desenvolvimento**:
   ```bash	
   npm run dev


Instalar dependências:
```bash
npm install @socket.io/admin-ui

### Implementação Segura:
1. **Para Logs**:
   ```bash
   npm install mongoose-history
   ```
   # Instalar SDK
npm install firebase-admin


2. **Para 2FA**:
   ```bash
   npm install speakeasy qrcode
   ```

3. **Para Senhas**:
   ```bash
   npm install bcryptjs
   ```

4. **Monitoramento**:
   ```bash
   npm install express-brute

Migrations**:
   ```bash
   # Criar migration para preferências
   npm run migrate create add_notification_preferences
   ```
Monitoramento**:
   ```bash
   # Configurar alerta para fila cheia
   kubectl apply -f alerts/notification-queue-full.yaml


2 Comandos para Implantação**
```bash
# Aplicar configurações
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f hpa.yaml

# Verificar status
kubectl get pods -l app=notification
kubectl describe hpa notification-hpa


**Fluxo Completo Integrado**

1. **Fluxo de Notificação**:
   ```mermaid
   sequenceDiagram
       participant App
       participant Backend
       participant FCM
       participant Dispositivo

       App->>Backend: Registrar Token (POST /devices)
       Backend->>Backend: Armazenar no MongoDB
       Backend->>Redis: Publicar evento (course.updated)
       Redis->>Backend: Consumir evento
       Backend->>FCM: Enviar notificação push
       FCM->>Dispositivo: Entregar notificação
       Dispositivo->>Backend: Confirmar recebimento
   ```

2. **Monitoramento**:
   ```bash
   # Verificar métricas customizadas
   kubectl get --raw /apis/external.metrics.k8s.io/v1beta1
   ```

3. **Escalonamento Automático**:
   - Baseado em CPU (70% de utilização)
   - Baseado em tamanho da fila Redis (>1000 mensagens)


Testes de Carga**:
   ```bash
   # Simular 1000 conexões WebSocket
   k6 run --vus 1000 --duration 30s websocket-test.js


. Script de Deploy Automatizado**
```bash
#!/bin/bash
# deploy-notifications.sh

# 1. Build da imagem
docker build -t notification-service:$GIT_SHA .

# 2. Push para o registry
docker push notification-service:$GIT_SHA

# 3. Rolling update no Kubernetes
kubectl set image deployment/notification-service \
  notification=notification-service:$GIT_SHA \
  --record


# 4. Verificação health check
timeout 300 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' http://notification-service/health)" != "200" ]]; do sleep 5; done' || exit 1

# 5. Rollback automático em caso de falha
if [ $? -ne 0 ]; then
  kubectl rollout undo deployment/notification-service
  exit 1
fi


1 Script de Verificação**
```bash
#!/bin/bash
# test-integration.sh

# Testar conexão MongoDB
curl -s http://localhost:3000/health | jq '.db' | grep 'UP' || exit 1

# Testar endpoint de métricas
curl -s http://localhost:3000/metrics | grep 'nodejs_' || exit 1

# Testar WebSocket
timeout 5 nc -z localhost 3000 || exit 1

echo "Todos os sistemas operando normalmente!"
```
Migrações de Banco**:
   ```bash
   npm install mongoose-migrate


. Notas de Implementação**

1. **Ordem de Inicialização**:
   - Banco de Dados → Message Broker → Firebase → HTTP Server
   - Workers iniciam após todas as conexões estarem estabelecidas

2. **Segurança**:
   - Todos os middlewares de segurança aplicados antes das rotas
   - WebSocket com rate limiting e autenticação JWT

3. **Resiliência**:
   - Tratamento de erros global para rejeições não capturadas
   - Health checks para monitoramento de dependências

npm install winston winston-loki winston-elasticsearch morgan