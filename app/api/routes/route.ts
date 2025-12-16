import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        _count: {
          select: { requests: true }
        }
      }
    });
    return NextResponse.json(routes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { slug, name, botToken, chatId } = data;

    const route = await prisma.route.create({
      data: {
        slug,
        name,
        botToken,
        chatId
      }
    });

    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create route' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id, slug, name, botToken, chatId } = data;

    const route = await prisma.route.update({
      where: { id },
      data: {
        slug,
        name,
        botToken,
        chatId
      }
    });

    return NextResponse.json(route);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.route.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
