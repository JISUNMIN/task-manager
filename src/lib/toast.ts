import { toast } from "react-hot-toast";

// Toast 모드 타입 정의
export enum ToastMode {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  INFO = "INFO",
  WARNING = "WARNING",
}

// Toast 액션 타입 정의 (필요한 액션들)
type SuccessAction =
  | "SAVE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "MAPPING"
  | "ADD_LIST"
  | "LDAPS"
  | "REGISTER"
  | "SESSION"
  | "COPY"
  | "REJECT";
type ErrorAction =
  | "SAVE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "MAPPING"
  | "LDAPS"
  | "REGISTER"
  | "SESSION"
  | "ISEXIST"
  | "SELECT"
  | "COPY"
  | "REJECT";
type InfoAction =
  | "LOADING"
  | "WAIT"
  | "NO_CHANGES"
  | "ONLY_DRAFT"
  | "ALREADY_EXIST"
  | "INVALID_STATUS"
  | "MINIMUM_10"
  | "MAXIMUM_20";
type WarningAction = "INCOMPLETE" | "PERMISSION" | "LIMIT_LENGTH";

type ToastActionMap = {
  [ToastMode.SUCCESS]: SuccessAction;
  [ToastMode.ERROR]: ErrorAction;
  [ToastMode.INFO]: InfoAction;
  [ToastMode.WARNING]: WarningAction;
};

// Toast 메시지 타입 정의
type ToastMessages = {
  [K in ToastMode]: Record<ToastActionMap[K], string>;
};

// Toast 메시지 상수
const TOAST_MESSAGES: ToastMessages = {
  [ToastMode.SUCCESS]: {
    SAVE: "저장이 완료되었습니다.",
    UPDATE: "수정이 완료되었습니다.",
    DELETE: "삭제가 완료되었습니다.",
    APPROVE: "승인이 완료되었습니다.",
    REJECT: "반려 완료되었습니다.",
    MAPPING: "데이터 맵핑이 완료되었습니다.",
    ADD_LIST: "목록에 추가하였습니다.",
    LDAPS: "사용가능한 ID입니다.",
    REGISTER: "회원가입이 완료되었습니다.",
    SESSION: "세션이 갱신되었습니다.",
    COPY: "복사 되었습니다.",
  },
  [ToastMode.ERROR]: {
    SAVE: "저장 중 오류가 발생했습니다.",
    UPDATE: "수정 중 오류가 발생했습니다.",
    DELETE: "삭제 중 오류가 발생했습니다.",
    APPROVE: "승인 중 오류가 발생했습니다.",
    REJECT: "반려에 실패하였습니다.",
    MAPPING: "데이터 맵핑 중 오류가 발생했습니다.",
    LDAPS: "사용할 수 없는 ID입니다.",
    REGISTER: "회원가입에 실패하였습니다.",
    SESSION: "세션 갱신에 실패하였습니다.",
    ISEXIST: "이미 가입된 회원입니다.",
    SELECT: "값을 선택해주세요.",
    COPY: "복사에 실패 하였습니다.",
  },
  [ToastMode.INFO]: {
    LOADING: "데이터를 불러오는 중입니다.",
    WAIT: "잠시만 기다려주세요.",
    NO_CHANGES: "변경 대상이 없습니다.",
    ONLY_DRAFT: "DRAFT 상태가 아닙니다.",
    ALREADY_EXIST: "이미 존재하는 데이터입니다.",
    INVALID_STATUS:
      "선택한 항목 중 상태를 변경할 수 없는 대상이 포함되어 있습니다.",
    MINIMUM_10: "최소 10개 이상 등록 가능합니다.",
    MAXIMUM_20: "최대 20개 까지 등록 가능합니다.",
  },
  [ToastMode.WARNING]: {
    INCOMPLETE: "모든 필드를 입력해주세요.",
    PERMISSION: "권한이 필요합니다.",
    LIMIT_LENGTH: "최대 2개 까지만 등록 가능합니다.",
  },
};

// Toast 호출용 파라미터 타입
type ToastParams<T extends ToastMode> = {
  type: T;
  action: ToastActionMap[T];
  content?: string;
};

// toast 띄우는 함수
export const showToast = <T extends ToastMode>({
  type,
  action,
  content,
}: ToastParams<T>) => {
  const message = content || TOAST_MESSAGES[type][action];

  switch (type) {
    case ToastMode.SUCCESS:
      toast.success(message);
      break;
    case ToastMode.ERROR:
      toast.error(message);
      break;
    case ToastMode.WARNING:
      toast(message, { style: { backgroundColor: "orange", color: "white" } });
      break;
    default:
      toast(message);
  }
};
