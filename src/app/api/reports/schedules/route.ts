import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// In-memory store for schedules (in production, use database)
const schedules = new Map<string, Schedule[]>();

interface Schedule {
    id: string;
    name: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    dayOfWeek?: number; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string; // HH:MM format
    reportType: 'executive' | 'detailed' | 'forecast';
    format: 'pdf' | 'csv' | 'excel' | 'json' | 'markdown';
    recipients: string[];
    enabled: boolean;
    lastRun?: string;
    nextRun?: string;
    createdAt: string;
    updatedAt: string;
}

// Calculate next run date
function calculateNextRun(schedule: Schedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
        case 'daily':
            if (next <= now) next.setDate(next.getDate() + 1);
            break;
        case 'weekly':
            const targetDay = schedule.dayOfWeek || 1; // Monday default
            const currentDay = now.getDay();
            let daysUntil = targetDay - currentDay;
            if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) {
                daysUntil += 7;
            }
            next.setDate(next.getDate() + daysUntil);
            break;
        case 'monthly':
            const targetDate = schedule.dayOfMonth || 1;
            next.setDate(targetDate);
            if (next <= now) {
                next.setMonth(next.getMonth() + 1);
            }
            break;
        case 'quarterly':
            const currentMonth = now.getMonth();
            const nextQuarterMonth = Math.ceil((currentMonth + 1) / 3) * 3;
            next.setMonth(nextQuarterMonth);
            next.setDate(schedule.dayOfMonth || 1);
            if (next <= now) {
                next.setMonth(next.getMonth() + 3);
            }
            break;
    }

    return next;
}

// GET: List all schedules for user
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id || session.user.email || 'default';
        const userSchedules = schedules.get(userId) || getDefaultSchedules();

        return NextResponse.json({
            success: true,
            schedules: userSchedules,
        });

    } catch (error) {
        console.error('Get schedules error:', error);
        return NextResponse.json({ error: 'Failed to get schedules' }, { status: 500 });
    }
}

// POST: Create a new schedule
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id || session.user.email || 'default';
        const body = await req.json();

        const newSchedule: Schedule = {
            id: `schedule-${Date.now()}`,
            name: body.name || 'New Schedule',
            description: body.description || '',
            frequency: body.frequency || 'weekly',
            dayOfWeek: body.dayOfWeek,
            dayOfMonth: body.dayOfMonth,
            time: body.time || '09:00',
            reportType: body.reportType || 'executive',
            format: body.format || 'pdf',
            recipients: body.recipients || [session.user.email].filter(Boolean),
            enabled: body.enabled !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        newSchedule.nextRun = calculateNextRun(newSchedule).toISOString();

        const userSchedules = schedules.get(userId) || [];
        userSchedules.push(newSchedule);
        schedules.set(userId, userSchedules);

        return NextResponse.json({
            success: true,
            schedule: newSchedule,
        });

    } catch (error) {
        console.error('Create schedule error:', error);
        return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }
}

// PUT: Update a schedule
export async function PUT(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id || session.user.email || 'default';
        const body = await req.json();
        const { id, ...updates } = body;

        const userSchedules = schedules.get(userId) || [];
        const scheduleIndex = userSchedules.findIndex(s => s.id === id);

        if (scheduleIndex === -1) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        userSchedules[scheduleIndex] = {
            ...userSchedules[scheduleIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        if (updates.frequency || updates.time || updates.dayOfWeek || updates.dayOfMonth) {
            userSchedules[scheduleIndex].nextRun = calculateNextRun(userSchedules[scheduleIndex]).toISOString();
        }

        schedules.set(userId, userSchedules);

        return NextResponse.json({
            success: true,
            schedule: userSchedules[scheduleIndex],
        });

    } catch (error) {
        console.error('Update schedule error:', error);
        return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
    }
}

// DELETE: Delete a schedule
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id || session.user.email || 'default';
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
        }

        const userSchedules = schedules.get(userId) || [];
        const filtered = userSchedules.filter(s => s.id !== id);

        if (filtered.length === userSchedules.length) {
            return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        schedules.set(userId, filtered);

        return NextResponse.json({
            success: true,
            message: 'Schedule deleted',
        });

    } catch (error) {
        console.error('Delete schedule error:', error);
        return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
    }
}

// Default schedules for demo
function getDefaultSchedules(): Schedule[] {
    const now = new Date();
    return [
        {
            id: 'schedule-default-1',
            name: 'Weekly Digest',
            description: 'Weekly financial overview sent every Monday',
            frequency: 'weekly',
            dayOfWeek: 1,
            time: '09:00',
            reportType: 'executive',
            format: 'pdf',
            recipients: [],
            enabled: true,
            nextRun: calculateNextRun({ frequency: 'weekly', dayOfWeek: 1, time: '09:00' } as Schedule).toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            id: 'schedule-default-2',
            name: 'Monthly Summary',
            description: 'Comprehensive monthly report on the 1st',
            frequency: 'monthly',
            dayOfMonth: 1,
            time: '09:00',
            reportType: 'detailed',
            format: 'excel',
            recipients: [],
            enabled: true,
            nextRun: calculateNextRun({ frequency: 'monthly', dayOfMonth: 1, time: '09:00' } as Schedule).toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
        {
            id: 'schedule-default-3',
            name: 'Board Deck Export',
            description: 'Quarterly board presentation deck',
            frequency: 'quarterly',
            dayOfMonth: 1,
            time: '08:00',
            reportType: 'forecast',
            format: 'pdf',
            recipients: [],
            enabled: false,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
        },
    ];
}
