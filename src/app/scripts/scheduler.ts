import cron from 'node-cron';
import { sendTomorrowSchedules } from '../lib/whatsapp';

cron.schedule('* * * * *', async () => {
    console.log('Sending daily doctor reminders...');
    await sendTomorrowSchedules();
});

console.log('Scheduler started');