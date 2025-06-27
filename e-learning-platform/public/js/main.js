   // Implementar retry com backoff exponencial
   async function sendWithRetry(tokens, payload, retries = 3) {
     try {
       return await fcm.sendPushNotification(tokens, payload);
     } catch (err) {
       if (retries > 0) {
         await new Promise(res => setTimeout(res, 1000 * (4 - retries)));
         return sendWithRetry(tokens, payload, retries - 1);
       }
       throw err;
     }
   }
