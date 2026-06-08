# 운동·식단 기록 (Docker 로컬 개발)

모바일 최적화 운동·유산소·식단 기록 웹앱입니다. PostgreSQL, MinIO(이미지), NextAuth(로그인)를 **Docker**로 실행합니다.

## 기능

- 식단 / 운동 / 유산소 기록 (운동 부위별 분류)
- 사진 업로드 (MinIO), 유튜브 URL 임베드
- 4종 메모 (느낀 점, 힘든 점, 부족한 점, 알고 싶은 점)
- 공개 범위: 나만 / 팔로워만 / 전체 공개
- 피드, 팔로우, 댓글 피드백, 트레이너 배지
- PWA manifest (홈 화면 추가 가능)

## 기술 스택

| 구분 | 기술 |
|------|------|
| 앱 | Next.js 16, TypeScript, Tailwind CSS |
| DB | PostgreSQL (Docker) |
| 로그인 | NextAuth (Credentials) |
| 파일 | MinIO (Docker, S3 호환) |
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

PostgreSQL(`localhost:5432`)과 MinIO(`localhost:9000`)가 실행됩니다.

### 1-2. 환경 변수

`.env.example`을 참고해 `.env` 파일이 있는지 확인하세요. (기본값으로 로컬 Docker에 연결됩니다)

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
- MinIO 콘솔: http://localhost:9001 (minioadmin / minioadmin)

## 3. Playwright E2E 테스트

인프라와 DB 시드가 준비된 상태에서:

```bash
npm run setup:local
npx playwright install chromium
npm run test:e2e
```

## 4. GitHub 업로드

### 4-1. GitHub에서 새 저장소 생성

1. https://github.com/new 접속
2. Repository name: `exercise_log` (원하는 이름)
3. **Public** 또는 Private 선택
4. README, .gitignore 추가 **하지 않음** (로컬에 이미 있음)
5. Create repository

### 4-2. 로컬에서 push

```bash
git add .
git commit -m "feat: Docker 기반 모바일 운동·식단 기록 웹앱"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exercise_log.git
git push -u origin main
```

`YOUR_USERNAME`을 본인 GitHub 아이디로 바꿔 주세요.

### 4-3. SSH 사용 시

```bash
git remote add origin git@github.com:YOUR_USERNAME/exercise_log.git
git push -u origin main
```

## 프로젝트 구조

```
exercise_log/
├── docker-compose.yml    # PostgreSQL + MinIO + App
├── Dockerfile
├── prisma/               # DB 스키마, 시드
├── src/
│   ├── app/              # 페이지 & API
│   ├── components/       # UI 컴포넌트
│   └── lib/              # DB, Storage, Actions
├── e2e/                  # Playwright 테스트
└── public/manifest.json  # PWA
```

## 환경 변수

| 변수 | 설명 |
|------|------|
| DATABASE_URL | PostgreSQL 연결 문자열 |
| AUTH_SECRET | NextAuth 시크릿 |
| AUTH_URL | 앱 URL |
| MINIO_* | MinIO 접속 정보 |

## 주의사항

- `.env` 파일은 Git에 올리지 마세요.
- 배포(Vercel 등)는 이 README 범위 밖입니다. Docker 로컬 + GitHub 업로드까지 포함합니다.
- MinIO 버킷 `record-images`는 `docker:infra` 실행 시 자동 생성됩니다.
