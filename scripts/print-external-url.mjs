import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getLanIpv4 } from "./network-utils.mjs";
import { readSavedTunnelPid } from "./start-host-tunnel.mjs";

const URL_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".tunnel-url",
);

const lanIp = getLanIpv4();
const tunnelPid = readSavedTunnelPid();
let externalUrl = null;

try {
  externalUrl = fs.readFileSync(URL_FILE, "utf8").trim();
} catch {
  // no saved url
}

console.log("\n========== Fit Link 접속 주소 ==========");
console.log(`본인 PC:     http://localhost:8082`);

if (lanIp) {
  console.log(`같은 Wi-Fi:  http://${lanIp}:8082`);
}

if (externalUrl && tunnelPid) {
  console.log(`\n★ 외부 접속:  ${externalUrl}`);
} else if (externalUrl) {
  console.log(`\n★ 외부 접속:  ${externalUrl}`);
  console.log("  (터널이 중지되었을 수 있습니다. npm run docker:public 재실행 권장)");
} else {
  console.log("\n★ 외부 접속:  없음 — npm run docker:public 을 먼저 실행하세요");
}

console.log("========================================\n");
