import { NextRequest, NextResponse } from 'next/server';
import { serialDataStore, SerialDataMessage } from '@/lib/data/serial-data';

// In a real implementation, we would use a library like serialport.js
// But since we're in a browser context, we'll simulate the serial data

export async function GET(request: NextRequest) {
  try {
    const userIds = serialDataStore.getAllUserIds();
    return NextResponse.json({ userIds });
  } catch (error) {
    console.error('Failed to get serial data:', error);
    return NextResponse.json({ error: 'Failed to get serial data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real implementation, this endpoint would receive actual data from the hardware
    // For now, we'll just parse the JSON from the request body
    const data = await request.json();
    const serialMessage = data as SerialDataMessage;
    
    // Validate the message format
    if (!serialMessage.userId || !serialMessage.messageType) {
      return NextResponse.json(
        { error: 'Invalid message format' }, 
        { status: 400 }
      );
    }
    
    // Process the message
    serialDataStore.processMessage(serialMessage);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process serial data:', error);
    return NextResponse.json(
      { error: 'Failed to process serial data' }, 
      { status: 500 }
    );
  }
} 