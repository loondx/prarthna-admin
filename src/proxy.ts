import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Redirect root to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Check for admin session token in cookies
  const token = req.cookies.get('prarthna_admin_token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
