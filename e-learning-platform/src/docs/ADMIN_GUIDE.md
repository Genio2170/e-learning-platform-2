Guia do Administrador

Fluxo de Aprovações

graph TD
    A[Novo Professor] --> B[Registro Pendente]
    B --> C{Admin Aprova?}
    C -->|Sim| D[Ativa Conta]
    C -->|Não| E[Notifica Rejeição]


Comandos Importantes

Backup manual
npm run backup

# Reiniciar serviços
pm2 restart all


## 3. Permissões
| Recurso          | Admin | Professor |
|------------------|-------|-----------|
| Aprovar Cursos   | ✅    | ❌        |
| Editar Conteúdo  | ✅    | ✅ (Próprio)




Gere o PNG com:
```bash
plantuml diagrams/architecture.puml
```

---

### **4. Checklist de Implementação**

| Tarefa                          | Comando/Arquivo                     | Status  |
|---------------------------------|-------------------------------------|---------|
| Configurar Socket.IO            | `app.js` + `monitoringService.js`   | ✅      |
| Implementar endpoint de métricas| `routes/metrics.js`                 | ✅      |
| Docker-compose para monitoramento| `docker-compose.monitoring.yml`     | ✅      |
| Documentação inicial            | `docs/ADMIN_GUIDE.md`               | ✅      |
| Diagramas de arquitetura        | `diagrams/`                         | ✅      |
 |
