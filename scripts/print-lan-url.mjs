import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getLanIpv4 } from "./network-utils.mjs";

function ensureWindowsFirewallRule() {
  if (process.platform !== "win32") return;

  const scriptPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "ensure-firewall.ps1",
  );

  try {
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { stdio: "inherit" },
    );
  } catch {
    console.warn("\n방화벽 규칙 추가 실패 — 관리자 PowerShell에서 실행하세요:");
    console.warn("  npm run docker:firewall");
  }
}

const ip = getLanIpv4();

console.log("\n--- Fit Link 접속 주소 ---");
console.log(`PC:       http://localhost:8082`);
if (ip) {
  console.log(`휴대폰:   http://${ip}:8082  (같은 Wi-Fi)`);
} else {
  console.log("휴대폰:   ipconfig 로 IPv4 확인 후 http://[PC-IP]:8082");
}
console.log("--------------------------\n");

ensureWindowsFirewallRule();
