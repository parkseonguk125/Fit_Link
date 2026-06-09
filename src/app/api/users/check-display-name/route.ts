import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDisplayNameTaken } from "@/lib/display-name";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const displayName = String(searchParams.get("displayName") ?? "").trim();

  if (!displayName) {
    return NextResponse.json({ available: true });
  }

  const session = await auth();
  const taken = await isDisplayNameTaken(
    displayName,
    session?.user?.id ?? undefined,
  );

  return NextResponse.json({ available: !taken });
}
