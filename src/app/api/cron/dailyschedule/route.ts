import { NextResponse } from 'next/server';
import { sendTomorrowSchedules } from '@/app/lib/whatsapp';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await sendTomorrowSchedules();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Cron error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}