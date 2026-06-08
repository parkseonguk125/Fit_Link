# Fit Link — 운동·식단 기록 (Docker 로컬 개발)

모바일 최적화 운동·유산소·식단 기록 웹앱입니다. PostgreSQL은 **Docker**로 실행하고, 사진은 로컬 볼륨(`uploads/`)에 저장합니다.

## 기능

- 식단 / 운동 / 유산소 기록 (운동 부위별 분류)
- 사진 업로드, 유튜브 URL 임베드
- 4종 메모 (느낀 점, 힘든 점, 부족한 점, 알고 싶은 점)
- 공개 범위: 나만 / 팔로워만 / 전체 공개
- 피드, 팔로우, 댓글 피드백, 트레이너 배지
- PWA manifest (홈 화면 추가 가능)

## 기술 스택

| 구분 | 기술 |
|------|------|
| 앱 | Next.js 16, TypeScript, Tailwind CSS |
| DB | PostgreSQL (Docker, Alpine 기반 자체 이미지) |
| 로그인 | NextAuth (Credentials) |
| 파일 | 로컬 파일 저장 (`uploads/`, Docker volume) |
| ORM | Prisma |
| 테스트 | Playwright |

## 사전 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 20+
- npm

## 1. 로컬 개발 (권장)

### 1-1. 인프라(Docker) 실행

```bash
npm install
npm run docker:infra
```

PostgreSQL(`localhost:5432`)이 실행됩니다. Docker Hub pull 없이 **로컬 Alpine 이미지**로 PostgreSQL을 빌드합니다.

### 1-2. 환경 변수

`.env.example`을 참고해 `.env` 파일이 있는지 확인하세요.

### 1-3. DB 마이그레이션 & 시드

```bash
npm run db:deploy
npm run db:seed
```

시드 계정:

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| user@test.com | password123 | 일반 |
| trainer@test.com | password123 | 트레이너 |

### 1-4. 앱 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 한 번에 설정

```bash
npm install
npm run setup:local
npm run dev
```

## 2. Docker로 앱까지 전체 실행

```bash
docker compose up -d --build
```

- 앱: http://localhost:3000
- DB: PostgreSQL (Docker 내부)

## 3. Playwright E2E 테스트

```bash
npm run setup:local
npx playwright install chromium
npm run test:e2e
```

## 4. GitHub 저장소

원격 저장소: https://github.com/parkseonguk125/Fit_Link.git

```bash
git remote add origin https://github.com/parkseonguk125/Fit_Link.git
git push -u origin main
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| DATABASE_URL | PostgreSQL 연결 문자열 |
| AUTH_SECRET | NextAuth 시크릿 |
| AUTH_URL | 앱 URL |
| UPLOAD_DIR | 업로드 파일 저장 경로 (기본 `./uploads`) |

## 주의사항

- `.env` 파일은 Git에 올리지 마세요.
- `uploads/` 폴더도 Git에 포함되지 않습니다.
- Docker Hub 네트워크 문제 시에도 `docker compose build postgres`로 DB를 로컬 빌드할 수 있습니다.
