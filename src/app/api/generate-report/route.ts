import { NextResponse } from 'next/server';
import { generateAccidentReport, type AccidentReport } from '@/lib/accidentReportAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transcript: string = body.transcript;

    if (typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Invalid transcript format in request body (must be a string)' }, { status: 400 });
    }

    //console.log('API route /api/generate-report received transcript:', transcript.substring(0, 100) + '...');

    // Call the report generation function
    const report: AccidentReport = await generateAccidentReport(transcript);

    //console.log('API route /api/generate-report result:', report);

    // Return the resulting report object
    return NextResponse.json({ report });

  } catch (error) {
    console.error('Error in /api/generate-report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    // Return error and indicate report is null
    return NextResponse.json({ error: errorMessage, report: null }, { status: 500 });
  }
} 