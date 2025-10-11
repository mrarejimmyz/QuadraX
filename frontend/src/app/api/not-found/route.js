import { NextResponse } from 'next/server'

// API route to handle Chrome DevTools requests
export async function GET() {
  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ message: 'Not found' }, { status: 404 })
}