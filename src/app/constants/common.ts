// labelColors
export const LABEL_COLOR_MAP: Record<string, string> = {
  feature: "bg-green-200 text-green-900",
  bug: "bg-red-200 text-red-900",
  design: "bg-pink-200 text-pink-900",
  refactor: "bg-yellow-200 text-yellow-900",
  client: "bg-blue-200 text-blue-900",
  internal: "bg-gray-200 text-gray-900",
  maintenance: "bg-purple-200 text-purple-900",
};

// labels
export const LABELS = [
  "feature", // 신규 기능 개발
  "bug", // 버그 수정
  "design", // 디자인 관련 작업
  "refactor", // 코드 리팩토링
  "client", // 클라이언트 요청
  "internal", // 내부 개선 및 사내 업무
  "maintenance", // 시스템 유지보수
] as const;
