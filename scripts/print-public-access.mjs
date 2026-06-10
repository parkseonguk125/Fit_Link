import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getLanIpv4 } from "./network-utils.mjs";
import { startHostTunnel } from "./start-host-tunnel.mjs";

const URL_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".tunnel-url",
);

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

const lanIp = getLanIpv4();

console.log("\n외부 접속용 터널 생성 중... (최대 45초)");
const externalUrl = await startHostTunnel(8082);

if (externalUrl) {
  fs.writeFileSync(URL_FILE, externalUrl);
}

console.log("\n========== Fit Link 접속 주소 ==========");
console.log(`본인 PC:     http://localhost:8082`);

if (lanIp) {
  console.log(`같은 Wi-Fi:  http://${lanIp}:8082`);
}

if (externalUrl) {
  console.log(`\n★ 외부 접속:  ${externalUrl}`);
  console.log("  → 이 링크를 다른 사람에게 공유하세요 (Wi-Fi/LTE 어디서나 접속)");
} else {
  console.log("\n★ 외부 접속:  터널 생성 실패");
  console.log("  Docker가 8082에서 실행 중인지 확인 후 다시 시도하세요.");
}

console.log("\n⚠️  PC가 켜져 있고 docker:public이 실행 중일 때만 외부 접속 가능");
console.log("   사용 후 npm run docker:down 으로 중지하세요.");
console.log("========================================\n");

ensureWindowsFirewallRule();
