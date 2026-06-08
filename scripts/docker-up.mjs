import { execSync } from "node:child_process";

function run(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch {
    // ignore: container may not exist
  }
}

function stopContainer(name) {
  try {
    execSync(`docker stop ${name}`, { stdio: "ignore" });
  } catch {
    // not running
  }
}

console.log("다른 Docker 스택을 중지합니다...");

// hanwhagreen (docker_exam2)
run("docker compose -p docker_exam2 down --remove-orphans");

// 이전 Fit Link / exercise_log 컨테이너
[
  "hanwhagreen-web2",
  "hanwhagreen-api2",
  "hanwhagreen-db",
  "hanwhagreen-web",
  "exercise_log_web",
  "exercise_log_api",
  "exercise_log_db",
  "fit_link_web",
  "fit_link_api",
  "fit_link_db",
].forEach(stopContainer);

run("docker compose -p exercise_log down --remove-orphans");

console.log("Fit Link를 시작합니다...");
run("docker compose up -d --build");

console.log("");
console.log("Fit Link 실행 완료");
console.log("접속: http://localhost:8081");
