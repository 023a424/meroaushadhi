import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// yo middleware ho jasle auth state ra protected routes lai handle garcha
export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res });
    
    await supabase.auth.getSession();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session && request.nextUrl.pathname.startsWith('/app')) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    if (session && request.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/app', request.url));
    }

    return res;
  } catch (e) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: ['/app/:path*', '/auth'],
}; 