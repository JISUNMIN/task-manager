import { Task } from "@prisma/client";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type Status =
  | "To Do"
  | "Ready"
  | "In Progress"
  | "On Hold"
  | "Completed";

export const ALL_STATUS: Status[] = [
  "To Do",
  "Ready",
  "In Progress",
  "On Hold",
  "Completed",
];

export type ClientTask = Omit<
  Task,
  "status" | "projectId" | "assignees" | "project" | "managerId"
> & {
  assignees?: number[];
  managerId?: number;
};

type Columns = {
  [key in Status]: ClientTask[];
};

export const useKanbanStore = create<{
  columns: Columns;
  initializeColumns: (
    tasks: {
      id: number;
      title: string;
      desc: string;
      status: Status;
      assignees?: number[];
    }[]
  ) => void;
  addTask: (index: number) => void;
  updateTask: (
    columnName: Status,
    index: number,
    task: Partial<ClientTask>
  ) => void;
  moveTask: (
    fromColumn: Status,
    toColumn: Status,
    fromIndex: number,
    toIndex: number
  ) => void;
  removeColumn: (columnKey: Status, index: number) => void;
}>()(
  devtools(
    persist(
      (set) => ({
        columns: {
          "To Do": [],
          Ready: [],
          "In Progress": [],
          "On Hold": [],
          Completed: [],
        },
        initializeColumns: (tasks) => {
          const newColumns: Columns = {
            "To Do": [],
            Ready: [],
            "In Progress": [],
            "On Hold": [],
            Completed: [],
          };

          tasks.forEach((task) => {
            if (ALL_STATUS.includes(task.status)) {
              newColumns[task.status].push({
                id: task.id,
                title: task.title,
                desc: task.desc,
                assignees: task.assignees || [],
              });
            }
          });

          set({ columns: newColumns });
        },
        addTask: (index: number) =>
          set((state) => {
            const columnKeys = Object.keys(state.columns) as Status[];
            const columnKey = columnKeys[index];
            if (!columnKey) return state;
            return {
              columns: {
                ...state.columns,
                [columnKey]: [
                  ...state.columns[columnKey],
                  { title: "", desc: "", assignees: [] },
                ],
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

            // 같은 column별 이동
            if (fromColumn === toColumn) {
              fromTasks.splice(toIndex, 0, taskToMove);
              return {
                columns: {
                  ...state.columns,
                  [fromColumn]: fromTasks,
                },
              };
            }
            // 다른 column별 이동
            else {
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
