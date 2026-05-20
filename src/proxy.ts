import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if the request is for an admin route
  if (pathname.startsWith('/admin')) {
    // 2. Allow access to the login page itself and assets
    if (pathname.startsWith('/admin/login') || pathname.includes('.')) {
      return NextResponse.next();
    }

    // 3. Check for the admin authentication cookie
    const adminAuth = request.cookies.get('admin_auth');

    if (!adminAuth || adminAuth.value !== 'true') {
      // 4. Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Specify which routes this proxy should run on
export const config = {
  matcher: ['/admin/:path*'],
};
