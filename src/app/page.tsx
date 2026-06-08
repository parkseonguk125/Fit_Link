import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/feed");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center bg-[#F8F9FA] px-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">운동·식단 기록</h1>
      <p className="mt-3 text-sm text-gray-600">
        사진과 메모로 운동을 기록하고, 피드백을 받아보세요.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <Link
          href="/login"
          className="min-h-12 rounded-xl bg-[#4A90A4] text-sm font-semibold leading-[3rem] text-white"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="min-h-12 rounded-xl bg-white text-sm font-semibold leading-[3rem] text-gray-800 ring-1 ring-gray-200"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
