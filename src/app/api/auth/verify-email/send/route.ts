import { NextResponse } from "next/server";
import { sendEmailVerificationCode } from "@/lib/email-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const result = await sendEmailVerificationCode(email, "SIGNUP");

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      message: result.message,
      devCode: result.devCode,
    });
  } catch (error) {
    console.error("[verify-email/send]", error);
    return NextResponse.json(
      { error: "인증 코드 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
