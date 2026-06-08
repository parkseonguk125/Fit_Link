import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      passwordHash,
      displayName: "운동러",
      bio: "꾸준히 기록하는 중",
      role: "USER",
    },
  });

  const trainer = await prisma.user.upsert({
    where: { email: "trainer@test.com" },
    update: {},
    create: {
      email: "trainer@test.com",
      passwordHash,
      displayName: "김트레이너",
      bio: "자세 교정과 피드백을 드립니다",
      role: "TRAINER",
    },
  });

  const existingRecord = await prisma.record.findFirst({
    where: { userId: user.id, category: "EXERCISE" },
  });

  if (!existingRecord) {
    await prisma.record.create({
      data: {
        userId: user.id,
        category: "EXERCISE",
        exercisePart: "CHEST",
        recordDate: new Date(),
        feltNote: "가슴 자극은 좋았지만 하단이 약한 느낌",
        hardNote: "마지막 세트에서 좌우 밸런스가 흔들림",
        lackingNote: "하부 가슴 자극",
        questionNote: "덤벨 프레스 각도 조언 부탁드려요",
        visibility: "PUBLIC",
        media: {
          create: [
            {
              mediaType: "YOUTUBE",
              url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  console.log("Seed completed:", { user: user.email, trainer: trainer.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
