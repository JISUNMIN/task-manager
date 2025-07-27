"use client";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import useProjects from "@/hooks/react-query/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/store/useUserStore";
import { DatePicker } from "@/components/form/DatePicker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useProjectMutations from "@/hooks/react-query/useProjectMutations";
import { Loader2Icon } from "lucide-react";

type Props = {
  onCancel: () => void;
  onCreated: () => void;
};

type FormValues = {
  projectName: string;
  deadline: string;
  managerId: number;
};

const DEFAULT_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const NewProjectCard = ({ onCancel, onCreated }: Props) => {
  const { users } = useUserStore();
  const { isListLoading } = useProjects();
  const { createProjectMutate, isCreatePending } = useProjectMutations();

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      deadline: DEFAULT_DATE.toISOString(),
    },
  });

  const onSubmit = (data: FormValues) => {
    createProjectMutate(data, {
      onSuccess: () => {
        onCreated();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border rounded-lg p-6 mb-3 shadow-md bg-[var(--item-bg)] border-[var(--sidebar-border)]"
    >
      <div className="mb-3 flex flex-col gap-1">
        <label className="text-sm font-medium">프로젝트명</label>
        <input
          className="w-full border p-2 rounded-md bg-[var(--input)]"
          {...register("projectName", { required: true })}
        />
      </div>

      <div className="mb-3 ">
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

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-sm font-medium">담당자</label>
        <Controller
          name="managerId"
          control={control}
          rules={{ required: "담당자를 선택해주세요" }}
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
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button
          type="submit"
          className={cn(isCreatePending ? "cursor-not-allowed" : "")}
          disabled={isListLoading || isCreatePending || !isValid}
        >
          {isCreatePending ? (
            <>
              <Loader2Icon className="animate-spin w-4 h-4" />
              <span>생성 중...</span>
            </>
          ) : (
            "확인"
          )}
        </Button>
      </div>
    </form>
  );
};

export default NewProjectCard;
