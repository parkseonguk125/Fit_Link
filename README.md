# Fit Link — 운동·식단 기록 (Docker 3-tier)

모바일 최적화 운동·유산소·식단 기록 웹앱입니다. **hanwhagreen과 같이 web / api / db 3개 컨테이너**로 구성됩니다.

## Docker 구조 (hanwhagreen과 동일 패턴)

| 컨테이너 | 역할 | 포트 | 설명 |
|----------|------|------|------|
| `exercise_log_web` | web (nginx) | **8082** → 80 | 브라우저 접속 주소 |
| `exercise_log_api` | api (Next.js) | **3002** → 3000 | API·서버 로직 |
| `exercise_log_db` | db (PostgreSQL) | **5432** → 5432 | 데이터베이스 |

```
브라우저 → web:8082 → api:3000 → db:5432
```

> hanwhagreen과 동시 실행 시 포트가 겹칠 수 있습니다. Fit Link는 **8082(web) / 3002(api)** 를 사용합니다. hanwhagreen만 쓸 때는 8081/3001입니다.

## 빠른 시작 (Docker 전체 실행)

```bash
npm install
npm run docker:up
```

브라우저에서 **http://localhost:8082** 접속

- DB 마이그레이션·시드는 `api` 컨테이너 시작 시 자동 실행됩니다.

### 테스트 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| user@test.com | password123 | 일반 |
| trainer@test.com | password123 | 트레이너 |

## 로컬 개발 (코드 수정 + 핫 리로드)

DB만 Docker, 앱은 PC에서 실행:

```bash
npm run setup:dev
npm run dev
```

http://localhost:3000 접속 (`.env`의 `AUTH_URL=http://localhost:3000`)

## Docker 명령어

```bash
npm run docker:up       # 3개 컨테이너 빌드 + 실행
npm run docker:infra    # 이미 빌드된 이미지로 3개 실행
npm run docker:down     # 전체 중지
npm run docker:logs     # 로그 확인
npm run docker:db-only  # DB만 실행
```

## Playwright E2E 테스트

```bash
npm run setup:dev
npx playwright install chromium
npm run test:e2e
```

## GitHub

https://github.com/parkseonguk125/Fit_Link.git

## 환경 변수

| 변수 | Docker 실행 | 로컬 dev |
|------|-------------|----------|
| AUTH_URL | `http://localhost:8082` | `http://localhost:3000` |
| DATABASE_URL | `...@localhost:5432/...` | 동일 |
