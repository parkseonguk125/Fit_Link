import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const KEEP_DISPLAY_NAMES = ["운동러", "박성욱2"] as const;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const keepUsers = await prisma.user.findMany({
    where: { displayName: { in: [...KEEP_DISPLAY_NAMES] } },
    select: { id: true, email: true, displayName: true },
    orderBy: { displayName: "asc" },
  });

  if (keepUsers.length !== KEEP_DISPLAY_NAMES.length) {
    const found = keepUsers.map((user) => user.displayName);
    const missing = KEEP_DISPLAY_NAMES.filter((name) => !found.includes(name));
    throw new Error(`유지할 계정을 찾지 못했습니다: ${missing.join(", ")}`);
  }

  const deleteResult = await prisma.user.deleteMany({
    where: { id: { notIn: keepUsers.map((user) => user.id) } },
  });

  const remaining = await prisma.user.findMany({
    select: { email: true, displayName: true, role: true },
    orderBy: { displayName: "asc" },
  });

  console.log(`삭제: ${deleteResult.count}명`);
  console.log(`남은 계정 (${remaining.length}명):`);
  for (const user of remaining) {
    console.log(`- ${user.displayName} (${user.email}) [${user.role}]`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
