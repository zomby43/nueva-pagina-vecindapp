import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('✅ Login simple route called');

  try {
    const body = await request.json();
    console.log('Body:', body);

    return NextResponse.json({
      success: true,
      message: 'API route funcionando',
      received: body
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
