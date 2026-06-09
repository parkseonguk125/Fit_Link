import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadImage } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, file.name, file.type);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "업로드 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
