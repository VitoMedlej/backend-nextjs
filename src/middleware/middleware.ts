// FILE: middleware.ts
// TYPE: global API middleware

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const PUBLIC_PATHS = ["/api/health-check"]; 

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next();
    }

    const auth = req.headers.get("authorization")?.split(" ")[1];
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(auth, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ message: "Invalid token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
