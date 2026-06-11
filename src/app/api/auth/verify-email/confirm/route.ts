import { NextResponse } from "next/server";
import { confirmEmailVerificationCode } from "@/lib/email-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const code = String(body.code ?? "");
    const result = await confirmEmailVerificationCode(email, code, "SIGNUP");

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "이메일 인증 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
