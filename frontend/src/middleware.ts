// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/register'];

const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => pathname.startsWith(route));
};

const isAdminRoute = (pathname: string) => {
  return pathname.startsWith('/users') || pathname.startsWith('/settings');
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;
  const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null;

  if (isPublicRoute(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(pathname) && user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};