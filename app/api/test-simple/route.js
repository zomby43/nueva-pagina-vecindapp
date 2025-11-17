import { NextResponse } from 'next/server';

console.log('[TEST-INIT] Simple test route loaded at startup');

export async function GET(request) {
  console.log('[TEST-API] GET request received');
  return NextResponse.json({
    success: true,
    message: 'Test API route works!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  console.log('[TEST-API] POST request received');
  const body = await request.json();
  console.log('[TEST-API] Body:', body);
  return NextResponse.json({
    success: true,
    message: 'POST works!',
    received: body
  });
}
