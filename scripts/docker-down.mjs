import { execSync } from "node:child_process";
import { removePortForward } from "./remove-port-forward.mjs";
import { stopHostTunnel } from "./start-host-tunnel.mjs";

stopHostTunnel();
await removePortForward();

execSync("docker compose down", { stdio: "inherit", cwd: process.cwd() });
