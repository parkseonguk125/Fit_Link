import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;
const PID_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".tunnel.pid",
);

function spawnCloudflared(port) {
  const args = ["-y", "cloudflared", "tunnel", "--url", `http://localhost:${port}`];

  if (process.platform === "win32") {
    return spawn("cmd.exe", ["/c", "npx", ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
  }

  return spawn("npx", args, {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

export function readSavedTunnelPid() {
  try {
    const raw = fs.readFileSync(PID_FILE, "utf8").trim();
    const pid = Number(raw);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

export function stopHostTunnel() {
  const pid = readSavedTunnelPid();
  if (!pid) return false;

  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      process.kill(pid);
    }
  } catch {
    // already stopped
  }

  try {
    fs.unlinkSync(PID_FILE);
  } catch {
    // ignore
  }

  const urlFile = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    ".tunnel-url",
  );
  try {
    fs.unlinkSync(urlFile);
  } catch {
    // ignore
  }

  return true;
}

export async function startHostTunnel(port = 8082) {
  stopHostTunnel();

  return new Promise((resolve) => {
    const proc = spawnCloudflared(port);
    let resolved = false;

    const handleChunk = (chunk) => {
      if (resolved) return;
      const match = chunk.toString().match(URL_RE);
      if (!match) return;

      resolved = true;
      fs.writeFileSync(PID_FILE, String(proc.pid));
      proc.stdout?.removeAllListeners("data");
      proc.stderr?.removeAllListeners("data");
      proc.unref();
      resolve(match[0]);
    };

    proc.stdout?.on("data", handleChunk);
    proc.stderr?.on("data", handleChunk);

    proc.on("error", () => {
      if (resolved) return;
      resolved = true;
      resolve(null);
    });

    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      try {
        proc.kill();
      } catch {
        // ignore
      }
      resolve(null);
    }, 45000);
  });
}
