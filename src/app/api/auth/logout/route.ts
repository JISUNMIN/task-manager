import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  const isSecureRequest = req.headers.get("x-forwarded-proto") === "https";

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: isSecureRequest,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
