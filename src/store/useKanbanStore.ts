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
  progress: number;
  setProgress: (value: number) => void;
  recalcProgress: () => void;
  initializeColumns: (
    tasks: {
      id: number;
      title: string;
      desc: string;
      status: Status;
      assignees?: number[];
      order: number;
    }[]
  ) => void;
  addTask: (
    index: number,
    orderType?: "top" | "bottom",
    tempId?: string
  ) => void;
  replaceTempTask: (columnKey: Status, tempId: string, realTask: Task) => void;
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
      (set, get) => ({
        columns: {
          "To Do": [],
          Ready: [],
          "In Progress": [],
          "On Hold": [],
          Completed: [],
        },
        progress: 0,
        setProgress: (value) => set({ progress: value }),
        recalcProgress: () => {
          const cols = get().columns;
          const total = Object.values(cols).reduce((acc, arr) => acc + arr.length, 0);
          const completed = cols["Completed"].length;
          const newProgress = total === 0 ? 0 : Math.floor((completed / total) * 100);
          set({ progress: newProgress });
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
                order: task.order,
              });
            }
          });

          set({ columns: newColumns });
          get().recalcProgress(); 
        },
        addTask: (index, orderType = "bottom", tempId) =>
          set((state) => {
            const columnKeys = Object.keys(state.columns) as Status[];
            const columnKey = columnKeys[index];
            if (!columnKey) return state;

            const newTask = { id: tempId, title: "", desc: "", assignees: [] };
            const updatedColumn =
              orderType === "top"
                ? [newTask, ...state.columns[columnKey]]
                : [...state.columns[columnKey], newTask];

            const newState = {
              columns: { ...state.columns, [columnKey]: updatedColumn },
            };
            get().recalcProgress(); 
            return newState;
          }),
        replaceTempTask: (columnKey, tempId, realTask) =>
          set((state) => {
            const updatedColumn = state.columns[columnKey].map((t) =>
              String(t.id) === tempId ? realTask : t
            );
            const newState = { columns: { ...state.columns, [columnKey]: updatedColumn } };
            get().recalcProgress(); 
            return newState;
          }),
        updateTask: (columnName, index, updatedFields) =>
          set((state) => {
            const updatedColumn = [...state.columns[columnName]];
            updatedColumn[index] = {
              ...updatedColumn[index],
              ...updatedFields,
            };
            const newState = { columns: { ...state.columns, [columnName]: updatedColumn } };
            get().recalcProgress(); 
            return newState;
          }),
        moveTask: (fromColumn, toColumn, fromIndex, toIndex) =>
          set((state) => {
            const fromTasks = [...state.columns[fromColumn]];
            const taskToMove = fromTasks.splice(fromIndex, 1)[0];
            if (!taskToMove) return state;

            if (fromColumn === toColumn) {
              fromTasks.splice(toIndex, 0, taskToMove);
              const newState = { columns: { ...state.columns, [fromColumn]: fromTasks } };
              get().recalcProgress();
              return newState;
            } else {
              const toTasks = [...state.columns[toColumn]];
              toTasks.splice(toIndex, 0, taskToMove);
              const newState = {
                columns: { ...state.columns, [fromColumn]: fromTasks, [toColumn]: toTasks },
              };
              get().recalcProgress();
              return newState;
            }
          }),
        removeColumn: (columnKey, index) =>
          set((state) => {
            const newColumns = { ...state.columns };
            if (newColumns[columnKey]) newColumns[columnKey].splice(index, 1);
            const newState = { columns: newColumns };
            get().recalcProgress();
            return newState;
          }),
      }),
      {
        name: "kanban-store",
      }
    )
  )
);
