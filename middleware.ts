import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and admin panel
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname === '/admin' ||
    request.nextUrl.pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Extract route from URL
  const route = request.nextUrl.pathname.split('/')[1]

  try {
    // Check if route exists in database
    const routeConfig = await prisma.route.findUnique({
      where: { slug: route }
    })

    if (!routeConfig) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error in middleware:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
