// Em scripts/maintenance.js
await notificationService.sendSystemNotification({
  type: 'maintenance',
  title: 'Manutenção programada',
  message: 'Sistema ficará indisponível das 00h às 02h',
  priority: 4
});
