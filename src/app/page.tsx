import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DEFAULT_APP_PATH } from "@/lib/nav-tabs";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect(DEFAULT_APP_PATH);
  }

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#E3F0ED] via-[#F5F8F9] to-[#EAF2F5]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-[#4A90A4]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-24 h-48 w-48 rounded-full bg-[#7CB8A8]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #4A90A4 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 w-full">
        <p className="text-4xl font-bold tracking-tight text-[#2D6A7A] sm:text-5xl">
          Fit Link
        </p>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">운동·식단 기록</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          사진과 메모로 운동을 기록하고, 피드백을 받아보세요.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="min-h-12 rounded-xl bg-[#4A90A4] text-sm font-semibold leading-[3rem] text-white shadow-sm shadow-[#4A90A4]/20"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="min-h-12 rounded-xl bg-white/90 text-sm font-semibold leading-[3rem] text-gray-800 ring-1 ring-gray-200/80 backdrop-blur-sm"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}
