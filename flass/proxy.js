import { NextResponse } from 'next/server';
import { ratelimit } from '@/lib/ratelimit';

export async function proxy(request) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Get client IP address
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    
    // Rate limit per IP + route path so different endpoints can be loaded without blocking normal site usage
    const identifier = `${ip}:${request.nextUrl.pathname}`;
    
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    
    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Try again in a minute.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
