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
  moveTask: (
    fromColumn: status,
    toColumn: status,
    fromIndex: number,
    toIndex: number
  ) => void;
  removeColumn: (columnKey: status, index: number) => void;
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
        moveTask: (fromColumn, toColumn, fromIndex, toIndex) =>
          set((state) => {
            const fromTasks = [...state.columns[fromColumn]];
            const taskToMove = fromTasks.splice(fromIndex, 1)[0];

            if (!taskToMove) return state;

            if (fromColumn === toColumn) {
              fromTasks.splice(toIndex, 0, taskToMove);
              return {
                columns: {
                  ...state.columns,
                  [fromColumn]: fromTasks,
                },
              };
            } else {
              const toTasks = [...state.columns[toColumn]];
              toTasks.splice(toIndex, 0, taskToMove);
              return {
                columns: {
                  ...state.columns,
                  [fromColumn]: fromTasks,
                  [toColumn]: toTasks,
                },
              };
            }
          }),
        removeColumn: (columnKey, index) => {
          set((state) => {
            const column = state.columns[columnKey];

            if (column.length <= 1) {
              return state;
            }

            const newColumns = { ...state.columns };

            if (newColumns[columnKey]) {
              newColumns[columnKey].splice(index, 1);
            }
            return { columns: newColumns };
          });
        },
      }),
      {
        name: "kanban-store",
      }
    )
  )
);
