import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "./lib/verifyAuth";

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    
    // Skip proxy for auth pages and static files
    if (
        path.startsWith('/login') ||
        path.startsWith('/register') ||
        path.startsWith('/verify') ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    console.log('🔍 Proxy executing for path:', path);
    
    try {
        const user = await verifyAuth();
        console.log('✅ User verified:', user);

        if (!user || !user.userId) {
            console.log('❌ No user found, redirecting to login');
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', user.userId);
        
        console.log('✅ Auth successful, allowing access to:', path);

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
        
    } catch (error) {
        console.error("❌ Proxy auth error:", error);
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

// This matcher runs proxy on ALL routes
export const config = {
    matcher: '/:path*'
}
