import { stopHostTunnel } from "./start-host-tunnel.mjs";

if (stopHostTunnel()) {
  console.log("인터넷 터널을 중지했습니다.");
} else {
  console.log("실행 중인 터널이 없습니다.");
}
