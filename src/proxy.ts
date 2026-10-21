import { NextResponse, type NextRequest } from "next/server";

/**
 * An early, optimistic check for /admin: no session cookie at all → straight to the login page, before anything
 * renders. The real check (signature, expiry, account) stays on the server, in the page and every API route.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.get("wd_admin")?.value) return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/classic"] };
