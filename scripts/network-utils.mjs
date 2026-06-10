import os from "node:os";

export function getLanIpv4() {
  const nets = os.networkInterfaces();
  const candidates = [];

  for (const entries of Object.values(nets)) {
    for (const net of entries ?? []) {
      if (net.family !== "IPv4" || net.internal) continue;
      candidates.push(net.address);
    }
  }

  const preferred = candidates.find((ip) => ip.startsWith("192.168."));
  return preferred ?? candidates.find((ip) => !ip.startsWith("172.")) ?? candidates[0];
}

export async function getPublicIpv4() {
  const controllers = [
    new AbortController(),
    new AbortController(),
  ];
  const timeout = setTimeout(() => {
    controllers[0].abort();
    controllers[1].abort();
  }, 5000);

  try {
    const endpoints = [
      "https://api.ipify.org?format=json",
      "https://ifconfig.me/ip",
    ];

    for (let i = 0; i < endpoints.length; i += 1) {
      try {
        const response = await fetch(endpoints[i], {
          signal: controllers[i].signal,
        });
        if (!response.ok) continue;

        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (data.ip) return data.ip;
        }

        const text = (await response.text()).trim();
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(text)) return text;
      } catch {
        // try next endpoint
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  return null;
}
