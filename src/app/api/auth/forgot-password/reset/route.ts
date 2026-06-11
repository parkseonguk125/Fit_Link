import { NextResponse } from "next/server";
import { resetPasswordWithCode } from "@/lib/email-verification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const code = String(body.code ?? "");
    const password = String(body.password ?? "");
    const result = await resetPasswordWithCode(email, code, password);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "비밀번호 재설정 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
