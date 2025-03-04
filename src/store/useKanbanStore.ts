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
  addTask: (
    columnName: "To Do" | "Ready" | "In Progress" | "On Hold" | "Completed",
    task: string
  ) => void;
  setTaskDescription: (
    columnName: "To Do" | "Ready" | "In Progress" | "On Hold" | "Completed",
    taskIndex: number,
    description: string
  ) => void;
  startAddingTask: () => void;
  stopAddingTask: () => void;
  newTaskInput: string;
  setNewTaskInput: (input: string) => void;
  isAddingTask: boolean; // 새 작업을 추가할 때 활성화되는 상태
  toggleAddingTask: () => void; // 버튼을 눌렀을 때 입력 영역을 토글하는 함수
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  columns: {
    "To Do": [],
    Ready: [],
    "In Progress": [],
    "On Hold": [],
    Completed: [],
  },
  newTaskInput: "",
  isAddingTask: false, // 초기 상태는 입력 영역이 표시되지 않음
  addTask: (columnName, task) =>
    set((state) => ({
      columns: {
        ...state.columns,
        [columnName]: [...state.columns[columnName], task],
      },
    })),
  setTaskDescription: (columnName, taskIndex, description) =>
    set((state) => {
      const updatedTasks = [...state.columns[columnName]];
      updatedTasks[taskIndex] = description;
      return {
        columns: {
          ...state.columns,
          [columnName]: updatedTasks,
        },
      };
    }),
  startAddingTask: () => set({ newTaskInput: "" }),
  stopAddingTask: () => set({ newTaskInput: "" }),
  setNewTaskInput: (input) => set({ newTaskInput: input }),
  toggleAddingTask: () =>
    set((state) => ({ isAddingTask: !state.isAddingTask })),
}));
