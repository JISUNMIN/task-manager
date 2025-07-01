"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useProjects from "@/hooks/useProjects";

type Props = {
  onCancel: () => void;
  onCreated: () => void;
};

type User = {
  id: number;
  name: string;
};

type FormValues = {
  projectName: string;
  deadline: string;
  managerId: number;
};

const NewProjectCard = ({ onCancel, onCreated }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const { createProjectMutate, isListPending } = useProjects();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const selectedManager = watch("managerId");

  const onSubmit = (data: FormValues) => {
    createProjectMutate(data);
    onCreated();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border rounded-lg p-4 bg-white shadow-md"
    >
      <div className="mb-3">
        <label className="block text-sm font-medium">프로젝트명</label>
        <input
          className="w-full border p-2 rounded"
          {...register("projectName", { required: true })}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">마감일</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          {...register("deadline", { required: true })}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">담당자</label>
        <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {users.map((user) => (
            <label key={user.id} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedManager === user.id}
                onChange={() => setValue("managerId", user.id)}
              />
              {user.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border rounded text-gray-600"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={isListPending || !isValid}
        >
          {isListPending || isSubmitting ? "생성 중..." : "확인"}
        </button>
      </div>
    </form>
  );
};

export default NewProjectCard;
