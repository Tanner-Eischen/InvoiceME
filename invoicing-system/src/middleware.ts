import { NextRequest, NextResponse } from 'next/server';

// Rewrite legacy '/dashboard/*' URLs to their route-group-equivalent paths '/*'
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow '/dashboard' itself (actual dashboard page), rewrite only nested paths
  if (pathname.startsWith('/dashboard/')) {
    const rest = pathname.slice('/dashboard/'.length);
    const url = req.nextUrl.clone();
    url.pathname = `/${rest}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};