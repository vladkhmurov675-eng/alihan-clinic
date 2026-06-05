
import { sendTomorrowSchedules } from '@/app/lib/whatsapp';

async function main() {
    console.log('Sending reminders...');
    await sendTomorrowSchedules();
    console.log('Done');
}

main()
    .catch(console.error)
    .finally(() => process.exit());