setInterval(async () => {
  const failedMsg = await redis.lpop('dlq:notifications');
  if (failedMsg) {
    const notification = JSON.parse(failedMsg);

    await NotificationFailed.create({
      ...notification,
      retryCount: 0
    });

    // Alertar equipe via Slack
    await slack.sendAlert(`Falha crítica: ${notification.type}`);
  }
}, 60000); // Checar a cada 1 minuto
