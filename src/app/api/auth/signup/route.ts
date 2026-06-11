import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  DISPLAY_NAME_DUPLICATE_ERROR,
  isDisplayNameTaken,
} from "@/lib/display-name";
import { assertSignupEmailVerified } from "@/lib/email-verification";
import { isValidEmail } from "@/lib/form-validation";
import { prisma } from "@/lib/prisma";
import { parseTrainerProfile } from "@/lib/trainer-profile";
import type { Role } from "@/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    const displayName = String(body.displayName ?? "").trim();
    const role = (body.role ?? "USER") as Role;
    const isTrainer = role === "TRAINER";
    const trainerProfile = parseTrainerProfile(body);

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "모든 필수 항목을 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식으로 입력해 주세요." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 },
      );
    }

    const emailVerified = await assertSignupEmailVerified(email);
    if (!emailVerified) {
      return NextResponse.json(
        { error: "이메일 인증을 완료해 주세요." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 },
      );
    }

    if (await isDisplayNameTaken(displayName)) {
      return NextResponse.json(
        { error: DISPLAY_NAME_DUPLICATE_ERROR },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        emailVerified: new Date(),
        displayName,
        role: isTrainer ? "TRAINER" : "USER",
        trainerRegion: isTrainer ? trainerProfile.trainerRegion : "",
        trainerGymName: isTrainer ? trainerProfile.trainerGymName : "",
        trainerPosition: isTrainer ? trainerProfile.trainerPosition : "",
        trainerCareer: isTrainer ? trainerProfile.trainerCareer : "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: DISPLAY_NAME_DUPLICATE_ERROR },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
