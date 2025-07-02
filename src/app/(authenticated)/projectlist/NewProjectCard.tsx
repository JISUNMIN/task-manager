"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useProjects from "@/hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUser from "@/hooks/useUser";
import { useUserStore } from "@/store/useUserStore";
import { DatePicker } from "@/components/inputs/DatePicker";

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

const DEFAULT_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const NewProjectCard = ({ onCancel, onCreated }: Props) => {
  const { isListLoading, isListFetching } = useUser();
  const { users } = useUserStore();

  const { createProjectMutate, isListPending } = useProjects();

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      deadline: DEFAULT_DATE.toISOString(),
    },
  });

  const onSubmit = (data: FormValues) => {
    createProjectMutate(data);
    onCreated();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border rounded-lg p-6 mb-3 bg-white shadow-md"
    >
      <div className="mb-3">
        <label className="block text-sm font-medium">프로젝트명</label>
        <input
          className="w-full border p-2 rounded"
          {...register("projectName", { required: true })}
        />
      </div>

      <div className="mb-3">
        <Controller
          control={control}
          name="deadline"
          render={({ field }) => (
            <DatePicker
              label="마감일"
              value={field.value}
              onChange={field.onChange}
              defaultDate={DEFAULT_DATE}
            />
          )}
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium">담당자</label>
        <Controller
          name="managerId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="사용자 선택" />
              </SelectTrigger>
              <SelectContent>
                {users.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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
