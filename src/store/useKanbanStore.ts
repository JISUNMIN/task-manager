import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type status =
  | "To Do"
  | "Ready"
  | "In Progress"
  | "On Hold"
  | "Completed";

export const ALL_STATUS: status[] = [
  "To Do",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
];

type Task = {
  title: string;
  desc: string;
};

type Columns = {
  [key in status]: Task[];
};

export const useKanbanStore = create<{
  columns: Columns;
  addTask: (index: number) => void;
  updateTask: (columnName: status, index: number, task: Partial<Task>) => void;
  moveTask: (fromColumn: status, toColumn: status, index: number) => void;
}>()(
  devtools(
    persist(
      (set) => ({
        columns: {
          "To Do": [{ title: "", desc: "" }],
          Ready: [{ title: "", desc: "" }],
          "In Progress": [{ title: "", desc: "" }],
          "On Hold": [{ title: "", desc: "" }],
          Completed: [{ title: "", desc: "" }],
        },
        addTask: (index: number) =>
          set((state) => {
            const columnKeys = Object.keys(state.columns) as status[];
            const columnKey = columnKeys[index];
            if (!columnKey) return state;
            return {
              columns: {
                ...state.columns,
                [columnKey]: [...state.columns[columnKey], { title: "" }],
              },
            };
          }),
        updateTask: (columnName, index, updatedFields) =>
          set((state) => {
            const updatedColumn = [...state.columns[columnName]];
            updatedColumn[index] = {
              ...updatedColumn[index], // 기존 task 유지
              ...updatedFields, // 수정할 필드만 덮어씀
            };
            return {
              columns: {
                ...state.columns,
                [columnName]: updatedColumn,
              },
            };
          }),
        moveTask: (fromColumn, toColumn, index) =>
          set((state) => {
            const fromTasks = [...state.columns[fromColumn]];
            const taskToMove = fromTasks.splice(index, 1)[0];

            if (!taskToMove) return state;

            return {
              columns: {
                ...state.columns,
                [fromColumn]: fromTasks,
                [toColumn]: [taskToMove, ...state.columns[toColumn]],
              },
            };
          }),
      }),
      {
        name: "kanban-store",
      }
    )
  )
);
