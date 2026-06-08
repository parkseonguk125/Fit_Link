# Fit Link — 운동·식단 기록

모바일 최적화 운동·유산소·식단 기록 웹앱입니다. **web / api / db** 3개 Docker 컨테이너로 실행합니다.

## Docker 구조

| 컨테이너 | 역할 | 포트 | 접속 |
|----------|------|------|------|
| `fit_link_web` | web (nginx) | **8081** → 80 | 브라우저 주소 |
| `fit_link_api` | api (Next.js) | **3001** → 3000 | API |
| `fit_link_db` | db (PostgreSQL) | **5432** → 5432 | DB |

```
브라우저 → web:8081 → api:3000 → db:5432
```

## 빠른 시작

**Fit Link만 사용:** `npm run docker:up` 실행 시 hanwhagreen 등 다른 Docker 스택을 자동으로 중지한 뒤 Fit Link만 실행합니다.

```bash
npm install
npm run docker:up
```

브라우저: **http://localhost:8081**

- DB 마이그레이션·시드는 `api` 시작 시 자동 실행

### 테스트 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| user@test.com | password123 | 일반 |
| trainer@test.com | password123 | 트레이너 |

## Docker 명령어

```bash
npm run docker:up       # 3개 컨테이너 빌드 + 실행
npm run docker:down     # Fit Link 전체 중지
npm run docker:logs     # 로그 확인
npm run docker:restart  # 재시작
```

## 코드 수정 개발 (선택)

DB만 Docker, 앱은 PC에서 hot reload:

```bash
npm run setup:dev
npm run dev
```

http://localhost:3000 (`.env`의 `AUTH_URL=http://localhost:3000`)

## GitHub

https://github.com/parkseonguk125/Fit_Link.git

## 환경 변수

| 변수 | Docker (`docker:up`) | 로컬 dev (`npm run dev`) |
|------|----------------------|---------------------------|
| AUTH_URL | `http://localhost:8081` | `http://localhost:3000` |
| DATABASE_URL | `...@localhost:5432/exercise_log` | 동일 |
