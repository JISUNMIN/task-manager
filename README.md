# 🗂️ Task Manager

**Task Manager**는 기본적인 회원가입 및 로그인 기능을 기반으로,  
프로젝트 단위로 업무(Task)를 생성하고, 할당하고, 상태별로 관리할 수 있는 **팀 협업용 프로젝트 관리 도구**입니다.

> 🔗 **배포 주소**: [https://task-manager-pink-ten.vercel.app/](https://task-manager-pink-ten.vercel.app/)

<br />

## 🚀 주요 기능

### ✅ 사용자 인증
- 회원가입 / 로그인 기능
- **Zustand** 기반 인증 상태 관리
- **HttpOnly Cookie 기반 인증 처리**로 보안 강화 (XSS 방지)
- 사용자 프로필 이미지 업로드 및 수정 가능

---

### 📁 프로젝트 관리
- 프로젝트 생성 시 **담당자, 마감일(deadline), 진행률** 설정 가능
- 프로젝트 진행률은 하위 Task 상태 기준으로 자동 계산
- 프로젝트 목록 / 상세 페이지 구성

---

### 🧩 Task 관리
- 프로젝트 내 Task 생성 가능
- Task는 다음의 **상태(Status)** 중 하나를 가질 수 있습니다:
  - `To Do`
  - `Ready`
  - `In Progress`
  - `On Hold`
  - `Completed`
- **Drag & Drop**으로 Task 상태 변경 가능 (`react-beautiful-dnd` 기반)

---

### 👥 Task 상세 설정
- Task 별:
  - **담당자(Assignee)** 할당
  - **제목(Title)** 및 **내용(Content)** 작성 가능
  - **내용은 TipTap Editor**를 사용하여 Markdown 스타일 편집 가능 (`H1`, `H2`, bullet 등)

---

### 💬 댓글 시스템
- 각 Task에 **댓글(Comment)** 작성 가능
- **대댓글(Reply)** 작성 가능 (1-depth nesting)

---

### 📊 진행률 자동 계산
- 프로젝트의 진행률은 하위 Task 중 `Completed` 상태의 비율로 자동 산정

---

### 🖼️ 사용자 프로필
- 사용자 페이지에서 **프로필 이미지 업로드 및 변경** 가능

---

## 🛠️ 기술 스택

- **Next.js 15 (App Router)**
- **Prisma (ORM) + Supabase (DB)**
- **React Hook Form**
- **Zustand**(전역 상태 관리)
- **React Query (TanStack Query)**(데이터 fetching 및 캐싱)
- **TipTap Editor** (Rich Text Editor)
- **react-beautiful-dnd**(Drag & Drop 기능)
- **Tailwind CSS**(CSS)
- **인증 방식**: HTML-Only **쿠키 기반 인증 처리**
---

## ✨ 향후 개선 아이디어

- Task / Project 검색 및 필터 기능
- 알림(Notification) 시스템
- 태그 / 라벨 기능
- 실시간 협업 기능 (WebSocket 기반)

