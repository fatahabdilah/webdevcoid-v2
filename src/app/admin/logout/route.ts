import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/auth";

/** POST /admin/logout: clears the session cookie and goes back to the login page. */
export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login?e=out", request.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 0 });
  return res;
}
