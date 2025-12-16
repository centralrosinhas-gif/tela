import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendToTelegram(botToken: string, chatId: string, message: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message to Telegram');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    throw error;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const routeId = searchParams.get('routeId');

  try {
    const requests = await prisma.request.findMany({
      where: routeId ? { routeId } : undefined,
      include: { route: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { routeId, data } = await req.json();

    // Get route configuration
    const route = await prisma.route.findUnique({
      where: { id: routeId }
    });

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Create request record
    const request = await prisma.request.create({
      data: {
        routeId,
        data,
        status: 'pending'
      }
    });

    // Format message for Telegram
    const message = Object.entries(data)
      .map(([key, value]) => `<b>${key}</b>: ${value}`)
      .join('\n');

    const fullMessage = `🔔 Nova solicitação de <b>${route.name}</b>\n\n${message}`;

    // Send to Telegram
    try {
      await sendToTelegram(route.botToken, route.chatId, fullMessage);
      
      // Update request status to sent
      await prisma.request.update({
        where: { id: request.id },
        data: { status: 'sent' }
      });

      return NextResponse.json({ success: true, request });
    } catch (error) {
      // Update request status to error
      await prisma.request.update({
        where: { id: request.id },
        data: { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
