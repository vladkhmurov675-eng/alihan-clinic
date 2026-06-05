import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Self-contained Prisma connection — doesn't rely on @/db or Next.js context
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────
// SEND A SINGLE WHATSAPP MESSAGE
// ─────────────────────────────────────────

export async function sendWhatsAppMessage(
    phone: string,
    message: string
): Promise<boolean> {
    const instanceId = process.env.GREEN_API_ID;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
        console.error('GREEN_API_ID or GREEN_API_TOKEN missing from .env');
        return false;
    }

    try {
        console.log(`Sending WhatsApp to ${phone}...`);

        const response = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: `${phone.replace(/\D/g, '')}@c.us`,
                    message,
                }),
            }
        );

        const data = await response.json();
        const success = !!data.idMessage;

        console.log(`  → ${success ? 'sent ✓' : 'failed ✗'} (status ${response.status})`);
        return success;

    } catch (err) {
        console.error(`  → WhatsApp error for ${phone}:`, err);
        return false;
    }
}

// ─────────────────────────────────────────
// SEND TOMORROW'S SCHEDULE TO ALL DOCTORS
// ─────────────────────────────────────────

export async function sendTomorrowSchedules(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = tomorrow.toISOString().split('T')[0];

    console.log(`Fetching appointments for ${date}...`);

    const doctors = await prisma.doctor.findMany({
        include: {
            appointments: {
                where: {
                    date,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                },
                include: { procedure: true },
                orderBy: { time: 'asc' },
            },
        },
    });

    console.log(`Found ${doctors.length} doctors in system`);

    for (const doctor of doctors) {
        if (!doctor.appointments.length) {
            console.log(`  ${doctor.name}: no appointments tomorrow, skipping`);
            continue;
        }

        const lines = doctor.appointments.map(a => {
            const proc = a.procedure?.name || 'Консультация';
            const file = a.filePath ? ' 📎' : '';
            return `${a.time} — ${a.patientName} (${a.patientPhone}) · ${proc}${file}`;
        });

        const message = [
            `📅 Расписание на завтра (${date})`,
            ``,
            ...lines,
            ``,
            `Всего записей: ${doctor.appointments.length}`,
        ].join('\n');

        const sent = await sendWhatsAppMessage(doctor.phone, message);

        // Log to DB regardless of success
        await prisma.whatsAppLog.create({
            data: {
                recipientPhone: doctor.phone,
                recipientName: doctor.name,
                message,
                status: sent ? 'SENT' : 'FAILED',
            },
        });
    }

    // Clean up connection when called from a script (not from Next.js)
    if (process.env.STANDALONE === 'true') {
        await prisma.$disconnect();
        await pool.end();
    }
}

// ─────────────────────────────────────────
// STANDALONE — run directly with tsx
// npx tsx src/whatsapp.ts
// ─────────────────────────────────────────

if (process.env.STANDALONE === 'true') {
    sendTomorrowSchedules()
        .then(() => {
            console.log('Done.');
            process.exit(0);
        })
        .catch(err => {
            console.error('Fatal error:', err);
            process.exit(1);
        });
}
