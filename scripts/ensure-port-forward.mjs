import { upnpNat } from "@achingbrain/nat-port-mapper";

const PORT = 8082;
const GATEWAY_TIMEOUT_MS = 10000;

export async function ensurePortForward(lanIp) {
  const client = upnpNat();

  try {
    for await (const gateway of client.findGateways({
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })) {
      await gateway.map(PORT, lanIp, {
        protocol: "tcp",
        description: "Fit Link",
      });

      const externalIp = await gateway.externalIp();
      await gateway.stop();

      return {
        ok: true,
        externalIp,
        port: PORT,
      };
    }

    return { ok: false, reason: "공유기 UPnP를 찾지 못했습니다." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message };
  }
}
