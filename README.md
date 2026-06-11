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

### 외부에서 보기 (다른 Wi-Fi·LTE)

공유기 설정 없이 인터넷 어디서나 접속할 수 있습니다.

```bash
npm run docker:public
```

터미널에 **`★ 외부 접속: https://xxxx.trycloudflare.com`** 주소가 나옵니다.  
이 링크를 다른 사람에게 공유하면 됩니다.

- PC가 켜져 있고 `docker:public`이 실행 중일 때만 접속 가능
- 주소 다시 확인: `npm run docker:public:url`
- 사용 후 `npm run docker:down`으로 중지

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
npm run docker:public      # 실행 + 외부 접속 URL 생성
npm run docker:lan         # 같은 Wi-Fi 접속 URL만 출력
npm run docker:public:url  # 외부 접속 URL만 다시 출력
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

## Vercel 배포 (사진 업로드)

Vercel에서는 로컬 폴더 저장이 안 되므로 **Vercel Blob**을 사용합니다 (`BLOB_READ_WRITE_TOKEN` 있을 때 자동).

1. Vercel 프로젝트 → **Storage** → **Create Database** → **Blob** → **Continue**
2. 이름 예: `fit-link-blob` → **Create** → **Connect to Project** → `fit-link` 선택
3. GitHub에 push → Vercel 자동 재배포

로컬 Docker / `npm run dev`는 기존처럼 `uploads/` 폴더를 사용합니다.

## 환경 변수

| 변수 | Docker (`docker:up`) | Vercel | 로컬 dev (`npm run dev`) |
|------|----------------------|--------|---------------------------|
| AUTH_TRUST_HOST | `true` | `true` | `true` 권장 |
| AUTH_SECRET | (docker-compose) | 필수 | `.env` |
| AUTH_EMAIL_DEV_EXPOSE | `.env` 값 (기본 `true`, SMTP 사용 시 `false`) | — | SMTP 없을 때만 `true` |
| DATABASE_URL | `...@localhost:5433/exercise_log` | Neon URL | 동일 |
| SMTP_HOST / SMTP_USER / SMTP_PASS | `.env`에서 읽음 | (선택) | 네이버 메일 발송 |
| BLOB_READ_WRITE_TOKEN | — | Storage 연결 시 자동 | (선택) |
| AUTH_URL | 설정 안 함 | 설정 안 함 | `http://localhost:3000` |

### 이메일 인증 / 비밀번호 찾기 (네이버 메일)

비밀번호 찾기에서 **입력한 @naver.com 주소**로 인증 코드 6자리가 발송됩니다.  
(예: `hong123@naver.com` 입력 → `hong123@naver.com` 메일함으로 코드 도착)

#### 초보자용 설정 (5분)

**1단계 — 네이버 메일에서 SMTP 켜기**

1. [mail.naver.com](https://mail.naver.com) 접속 후 로그인
2. 우측 상단 **⚙ 환경설정** 클릭
3. **POP3/IMAP** 탭 → **IMAP/SMTP 사용** 을 **사용함**으로 변경
4. **저장**

**2단계 — 앱 비밀번호 만들기**

1. [nid.naver.com](https://nid.naver.com) → **내정보** → **보안설정**
2. **2단계 인증** 켜기 (꺼져 있으면)
3. **애플리케이션 비밀번호** → **생성**
4. 이름 예: `FitLink` → 생성된 **16자리 비밀번호** 복사  
   ⚠️ **네이버 로그인 비밀번호가 아닙니다!**

**3단계 — `.env` 파일 수정**

프로젝트 폴더의 `.env`를 열고 아래만 본인 정보로 바꿉니다.

```env
SMTP_USER="본인@naver.com"
SMTP_PASS="여기에_앱비밀번호_16자리"
SMTP_FROM="Fit Link <본인@naver.com>"
AUTH_EMAIL_DEV_EXPOSE="false"
```

**4단계 — Docker 재시작**

```bash
npm run docker:restart
```

**5단계 — 테스트**

1. `http://localhost:8082/forgot-password` 접속
2. 코드를 받을 **네이버 메일** 입력 (가입 시 쓴 주소)
3. **인증 코드 받기** 클릭
4. 해당 네이버 메일 **받은편지함·스팸함**에서 `[Fit Link] 비밀번호 재설정 코드` 확인

> **참고:** 코드는 누구나 받을 수 있지만, **비밀번호 변경**은 **이미 가입된 이메일**만 가능합니다.

SMTP가 없으면 서버 콘솔에 코드가 출력되며, `AUTH_EMAIL_DEV_EXPOSE=true`일 때만 화면/API에 코드가 노출됩니다.
