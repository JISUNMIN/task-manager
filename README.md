# 🗂️ Task Manager

**Task Manager**는 회원가입 및 로그인 기능을 기반으로,  
프로젝트 단위로 업무(Task)를 생성하고, 할당하며, 상태별로 관리할 수 있는 **팀 협업용 프로젝트 관리 도구**입니다.

> 🔗 [배포 주소](https://task-manager-pink-ten.vercel.app/)

---

## 🚀 주요 기능

### ⚡ UX / 퍼포먼스 개선

- **Optimistic UI 적용**: Task 및 프로젝트 상태 변경 시 즉시 반영되어 사용자 경험 개선
- **Skeleton UI 적용**: 데이터 로딩 시 자리 표시자 표시로 부드러운 화면 전환
- **반응형 디자인 구현**: Tailwind 기반으로 다양한 화면 크기 지원

### ✅ 사용자 인증

- 회원가입 / 로그인
- **Zustand** 기반 인증 상태 관리
- **HttpOnly Cookie 기반 인증** (보안 강화, XSS 방지)

### 🖼️ 사용자 프로필

- 프로필 이미지 업로드 및 변경 가능
- 비밀번호 변경 가능

### 🎨 UI/UX

- 다크 모드 / 라이트 모드 지원

### 📁 프로젝트 관리

- 프로젝트 생성: 담당자, 마감일, 프로젝트명 설정
- 프로젝트 수정(드롭메뉴): 담당자, 마감일 변경, 라벨 적용
- 하위 Task 상태 기준 프로젝트 진행률 자동 계산
- 프로젝트 목록 확인 가능
- 프로젝트명 길 경우 `...` 표시 + 툴팁으로 전체 이름 확인 가능
- **프로젝트 순서 변경** 지원 (DND Kit 사용, 상하좌우 이동 가능)
- **프로젝트별 라벨(Label) 설정** 가능: feature, bug, design, refactor, client, internal, maintenance
- **라벨 기반 필터링** 지원
- **마감일 상태 표시**: 남은 일수에 따라 라벨로 구분
  - `past` : 이미 마감 (빨강)
  - `soon` : 한 달 이내 마감 (노랑)
  - `normal` : 일반 (기본색)
  - Project 사이드바: 접기/펼치기 가능

### 🧩 Task 관리

- Task 생성 및 상태 관리 (`To Do`, `Ready`, `In Progress`, `On Hold`, `Completed`)
  - 상단 `+` 버튼: 맨 위에 생성
  - 하단 '새 작업 추가' 버튼: 맨 아래에 생성
- **Drag & Drop**으로 Task 상태 변경 (`react-beautiful-dnd`)
- 담당자 할당, 제목/내용 작성
- **TipTap Editor** 기반 Markdown 스타일 편집 (`H1`, `H2`, bullet 등)
  - TipTap 내 **파일 및 이미지 업로드 버튼** 제공, 이미지/파일 업로드 가능
  - Task 상세 패널: Task 클릭 시 우측 패널 열림, 크기 조절 가능

### 💬 댓글 시스템

- Task 댓글 및 대댓글 작성 가능 (1-depth)
- 댓글 내 **파일 및 이미지 업로드** 지원

### 📊 진행률 자동 계산

- 하위 Task 완료 비율 기반 프로젝트 진행률 산정

---

## 🛠️ 기술 스택

- **Next.js 15 (App Router)**
- **Prisma (ORM) + Supabase (DB)**
- **Supabase Storage**: 사용자 프로필, 댓글 이미지/파일 보관
- **React Hook Form**
- **Zustand**(전역 상태 관리)
- **React Query (TanStack Query)**(데이터 fetching 및 캐싱)
- **TipTap Editor** (Rich Text Editor)
- **react-beautiful-dnd**(Drag & Drop 기능)
- **Tailwind CSS**(반응형 UI 구현)
- **인증 방식**: HTML-Only **쿠키 기반 인증 처리**

---

## 💡 향후 개선 아이디어

- **Editor 개선**: TipTap 한계 보완, Drag & Drop으로 블록 단위 이미지/파일 편집
- **알림(Notification) 시스템**:Task 관련 이벤트 발생 시 실시간 알림 제공 (생성/담당자 지정, 댓글/대댓글 작성, 상태 변경(Completed), 마감일 임박, 기한 변경
- Task / Project 검색 기능
