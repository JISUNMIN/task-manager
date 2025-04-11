import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type status =
  | "To Do"
  | "Ready"
  | "In Progress"
  | "On Hold"
  | "Completed";

type Task = {
  title: string;
};

type Columns = {
  [key in status]: Task[];
};

export const useKanbanStore = create<{
  columns: Columns;
  addTask: (index: number) => void;
  updateTask: (columnName: status, task: string, index: number) => void;
}>()(
  devtools(
    persist(
      (set) => ({
        columns: {
          "To Do": [{ title: "" }],
          Ready: [{ title: "" }],
          "In Progress": [{ title: "" }],
          "On Hold": [{ title: "" }],
          Completed: [{ title: "" }],
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
        updateTask: (columnName, task, index) =>
          set((state) => {
            const updatedColumn = [...state.columns[columnName]];
            updatedColumn.splice(index, 1, { title: task });
            return {
              columns: {
                ...state.columns,
                [columnName]: updatedColumn,
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
