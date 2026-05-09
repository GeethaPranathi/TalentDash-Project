import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Secret must match the backend
const SECRET = new TextEncoder().encode('SECRET_KEY');

export default async function proxy(request) {
  const token = request.cookies.get('token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isProtectedPath = request.nextUrl.pathname.startsWith('/admin') || 
                          request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/recruiter');

  // If there's no token and the path is protected, redirect to login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a token, let's verify it and check roles
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      
      // Prevent logged in users from visiting login/register
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Role-based protection for /admin
      if (request.nextUrl.pathname.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Role-based protection for /recruiter
      if (request.nextUrl.pathname.startsWith('/recruiter') && payload.role !== 'recruiter' && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

    } catch (err) {
      // Token is invalid or expired
      if (isProtectedPath) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/recruiter/:path*', '/login', '/register'],
};
