   const { createLogger } = require('winston');
   const LokiTransport = require('winston-loki');

   const logger = createLogger({
     transports: [
       new LokiTransport({
         host: process.env.LOKI_URL
       })
     ]
   });
