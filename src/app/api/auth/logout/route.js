import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, mensaje: "Sesión cerrada." });
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
  return response;
}
