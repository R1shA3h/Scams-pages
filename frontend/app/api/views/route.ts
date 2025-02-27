import { NextResponse } from 'next/server';
import { incrementPageViews, getPageViews, getUniqueVisitors } from '@/lib/redis';

export async function POST() {
  try {
    const views = await incrementPageViews();
    const uniqueVisitors = await getUniqueVisitors();
    return NextResponse.json({ views, uniqueVisitors });
  } catch (error) {
    console.error('Error handling page views:', error);
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const views = await getPageViews();
    const uniqueVisitors = await getUniqueVisitors();
    return NextResponse.json({ views, uniqueVisitors });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json({ error: 'Failed to get views' }, { status: 500 });
  }
} 