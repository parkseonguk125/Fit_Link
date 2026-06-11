import "dotenv/config";
import { sendVerificationEmail } from "../src/lib/email";

async function main() {
  const to = process.env.SMTP_USER?.trim();
  if (!to) {
    console.error("SMTP_USER가 .env에 없습니다.");
    process.exit(1);
  }

  try {
    await sendVerificationEmail(to, "123456", "password_reset");
    console.log(`테스트 메일 발송 성공: ${to}`);
  } catch (error) {
    console.error("테스트 메일 발송 실패:");
    console.error(error);
    process.exit(1);
  }
}

main();
