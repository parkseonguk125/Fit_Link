import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { reverseOsm } from "@/lib/places/providers/osm";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "좌표가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const result = await reverseOsm(lat, lon);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "위치 확인 중 오류가 발생했습니다.",
      },
      { status: 502 },
    );
  }
}
