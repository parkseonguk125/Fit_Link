import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reverseOsm, searchOsm } from "@/lib/places/providers/osm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchOsm(query);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "장소 검색 중 오류가 발생했습니다.",
      },
      { status: 502 },
    );
  }
}
