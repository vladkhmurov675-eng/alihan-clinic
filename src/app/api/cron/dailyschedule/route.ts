import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    //  }

    try {
        // Lazy import — only runs at request time, never at build time
        const { sendTomorrowSchedules } = await import('@/app/lib/whatsapp');
        await sendTomorrowSchedules();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Cron error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}