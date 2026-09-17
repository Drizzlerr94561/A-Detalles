import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, mensaje: "Sesión cerrada." });
  response.cookies.set("admin_session", "", {
    path: "/",
    expires: new Date(0),
  });
  return response;
}
