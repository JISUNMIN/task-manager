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
  newTaskInputs: { [key in status]: string }; // 각 열별 입력 상태
  addTask: (index: number) => void;
  updateTask: (
    columnName: "To Do" | "Ready" | "In Progress" | "On Hold" | "Completed",
    task: string
  ) => void;
  setTaskDescription: (
    columnName: "To Do" | "Ready" | "In Progress" | "On Hold" | "Completed",
    taskIndex: number,
    description: string
  ) => void;
  resetTaskInput: () => void;
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
  newTaskInputs: {
    "To Do": "",
    Ready: "",
    "In Progress": "",
    "On Hold": "",
    Completed: "",
  },
  isAddingTask: false, // 초기 상태는 입력 영역이 표시되지 않음
  addTask: (index:number) =>
    set((state) => {
      const columnKeys: ColumnKeys[] = Object.keys(
        state.columns
      ) as ColumnKeys[];
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
  resetTaskInput: () => set({ newTaskInput: "" }),
  setNewTaskInput: (input) => set({ newTaskInput: input }),
  toggleAddingTask: () =>
    set((state) => ({ isAddingTask: !state.isAddingTask })),
}));
