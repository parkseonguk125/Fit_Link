import { upnpNat } from "@achingbrain/nat-port-mapper";

const PORT = 8082;

export async function removePortForward() {
  const client = upnpNat();

  try {
    for await (const gateway of client.findGateways({
      signal: AbortSignal.timeout(5000),
    })) {
      await gateway.unmap(PORT, { protocol: "tcp" });
      await gateway.stop();
      return true;
    }
  } catch {
    // ignore cleanup errors
  }

  return false;
}
