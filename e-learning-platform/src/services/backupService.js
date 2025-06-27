   const { exec } = require('child_process');
   const cron = require('node-cron');
   const path = require('path');

   exports.setupBackups = () => {
     // Backup diário às 2AM
     cron.schedule('0 2 * * *', () => {
       const date = new Date().toISOString().split('T')[0];
       const backupPath = path.join(__dirname, `../../backups/${date}.gz`);

       exec(`mongodump --uri="${process.env.MONGODB_URI}" --archive=${backupPath} --gzip`, (err) => {
         if (err) console.error('Backup failed:', err);
         else console.log('Backup completed:', backupPath);
       });
     });
   };
