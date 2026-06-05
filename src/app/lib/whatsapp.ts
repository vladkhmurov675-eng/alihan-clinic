import { prisma } from '@/db'


export async function sendWhatsAppMessage(
    phone: string,
    message: string
) {
    console.log('Sending WhatsApp...');
    console.log(phone);

    const response = await fetch(
        `https://api.green-api.com/waInstance${process.env.GREEN_API_ID}/sendMessage/${process.env.GREEN_API_TOKEN}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: `${phone.replace(/\D/g, '')}@c.us`,
                message,
            }),
        }
    );

    console.log('Status:', response.status);

    return response.json();
}

export async function sendTomorrowSchedules() {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    const date =
        tomorrow.toISOString().split('T')[0];

    const doctors = await prisma.doctor.findMany({
        include: {
            appointments: {
                where: {
                    date,
                    status: {
                        in: ['PENDING', 'CONFIRMED'],
                    },
                },
                orderBy: {
                    time: 'asc',
                },
            },
        },
    });

    for (const doctor of doctors) {
        if (!doctor.appointments.length) continue;

        const appointmentsList =
            doctor.appointments
                .map(
                    a =>
                        `${a.time} — ${a.patientName} (${a.patientPhone})`
                )
                .join('\n');

        const message = `
Ваши записи на завтра (${date})

${appointmentsList}
`;

        await sendWhatsAppMessage(
            doctor.phone,
            message
        );
    }
}