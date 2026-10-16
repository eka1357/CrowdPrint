import { NextRequest, NextResponse } from 'next/server';
import { runCrowdprintPipeline } from '@/lib/agent';
import { EventBrief } from '@/lib/types';

/**
 * Crowdprint Analysis API Endpoint
 * POST /api/analyze
 * Body: { brief?: Partial<EventBrief>, forceRefresh?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    let body: { brief?: Partial<EventBrief>; forceRefresh?: boolean } = {};

    try {
      body = await request.json();
    } catch {
      // Empty or invalid body defaults to standard pipeline preset
      body = {};
    }

    const { brief, forceRefresh } = body;
    const result = await runCrowdprintPipeline(brief, { forceRefresh });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[Crowdprint API Error]:', error);
    return NextResponse.json(
      {
        error: 'Failed to execute Crowdprint analysis pipeline',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 * Returns default preset analysis for quick browser testing
 */
export async function GET() {
  try {
    const result = await runCrowdprintPipeline();
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run default analysis', details: String(error) },
      { status: 500 }
    );
  }
}
