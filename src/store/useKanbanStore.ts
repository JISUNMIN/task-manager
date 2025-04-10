import { create } from "zustand";

export type status =
  | "To Do"
  | "Ready"
  | "In Progress"
  | "On Hold"
  | "Completed";

// 칸반 보드의 상태를 저장할 스토어
interface KanbanStore {
  columns: {
    "To Do": string[];
    Ready: string[];
    "In Progress": string[];
    "On Hold": string[];
    Completed: string[];
  };
  addTask: (index: number) => void;
  updateTask: (columnName: status, task: string, index: number) => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  columns: {
    "To Do": [{ title: "" }],
    Ready: [{ title: "" }],
    "In Progress": [{ title: "" }],
    "On Hold": [{ title: "" }],
    Completed: [{ title: "" }],
  },
  isAddingTask: false, // 초기 상태는 입력 영역이 표시되지 않음
  addTask: (index: number) =>
    set((state) => {
      const columnKeys: status[] = Object.keys(state.columns) as status[];
      console.log("columns", state.columns);
      const columnKey = columnKeys[index]; // index에 해당하는 key 찾기

      if (!columnKey) return state; // index가 범위를 벗어나면 그대로 반환

      return {
        columns: {
          ...state.columns,
          [columnKey]: [...state.columns[columnKey], { title: "" }], // 해당 컬럼에 추가
        },
      };
    }),
  updateTask: (columnName, task, index) =>
    set((state) => {
      console.log("columns2", state.columns);
      const updatedColumn = [...state.columns[columnName]];
      updatedColumn.splice(index, 1, { title: task });
      return {
        columns: {
          ...state.columns,
          [columnName]: updatedColumn,
        },
      };
    }),
}));
