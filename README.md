# Fit Link — 운동·식단 기록

모바일 최적화 운동·유산소·식단 기록 웹앱입니다. **web / api / db** 3개 Docker 컨테이너로 실행합니다.

hanwhagreen(8081/3001)과 **동시에** 실행할 수 있도록 Fit Link는 **8082 / 3002 / 5433** 포트를 사용합니다.

## Docker 구조

| 컨테이너 | 역할 | Fit Link 포트 | hanwhagreen (참고) |
|----------|------|---------------|---------------------|
| `fit_link_web` | web (nginx) | **8082** | 8081 |
| `fit_link_api` | api (Next.js) | **3002** | 3001 |
| `fit_link_db` | db (PostgreSQL) | **5433** | (내부) |

```
Fit Link:  브라우저 → web:8082 → api → db
hanwhagreen: 브라우저 → web:8081 → api → db  (그대로 유지)
```

## 빠른 시작

```bash
npm install
npm run docker:up
```

Fit Link 접속: **http://localhost:8082**

`npm run docker:up` 실행 후 터미널에 **휴대폰용 주소**가 출력됩니다.

### 휴대폰에서 보기 (같은 Wi-Fi)

1. PC에서 `npm run docker:up` 실행
2. 터미널에 나온 주소로 접속 (예: `http://192.168.219.100:8082`)
3. 주소를 다시 확인하려면: `npm run docker:lan`

> PC IP는 공유기마다 다릅니다. `192.168.0.15` 같은 예시 주소가 아니라 **본인 PC IPv4**를 써야 합니다.  
> Windows 방화벽 규칙은 `docker:up` 시 자동 추가를 시도합니다. 실패하면 관리자 PowerShell에서 8082 포트를 허용하세요.

- hanwhagreen은 건드리지 않습니다.
- DB 마이그레이션·시드는 `api` 시작 시 자동 실행

### 테스트 계정

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| user@test.com | password123 | 일반 |
| trainer@test.com | password123 | 트레이너 |

## Docker 명령어

```bash
npm run docker:up       # Fit Link 3개 컨테이너 빌드 + 실행 + 휴대폰 URL 출력
npm run docker:lan      # 휴대폰 접속 URL만 다시 출력
npm run docker:down     # Fit Link만 중지
npm run docker:logs     # 로그 확인
```

## 코드 수정 개발 (선택)

DB만 Docker, 앱은 PC에서 hot reload:

```bash
npm run setup:dev
npm run dev
```

http://localhost:3000 (`.env`의 `AUTH_URL=http://localhost:3000`, `DATABASE_URL` 포트 **5433**)

## GitHub

https://github.com/parkseonguk125/Fit_Link.git

## 환경 변수

| 변수 | Docker (`docker:up`) | 로컬 dev (`npm run dev`) |
|------|----------------------|---------------------------|
| AUTH_TRUST_HOST | `true` (localhost·LAN IP 모두 로그인 가능) | `true` 권장 |
| AUTH_URL | 설정 안 함 (접속 주소 자동) | `http://localhost:3000` 또는 PC IP |
| DATABASE_URL | `...@localhost:5433/exercise_log` | 동일 |
