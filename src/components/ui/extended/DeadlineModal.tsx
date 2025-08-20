import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../button";
import { useFormContext } from "react-hook-form";

interface DeadlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (date: Date) => void;
  name: string;
  initialDate?: Date;
}

export function DeadlineModal({
  open,
  onOpenChange,
  onConfirm,
  name,
  initialDate,
}: DeadlineModalProps) {
  const { setValue } = useFormContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate
  );

  const onClickConfirm = () => {
    onOpenChange(false);
    if (selectedDate) {
      onConfirm(selectedDate);
      setValue(name, selectedDate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>마감일 설정</DialogTitle>
          <DialogDescription>
            변경할 프로젝트 마감일을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setValue(name, date);
            }}
            className="rounded-md border shadow-sm bg-[var(--box-bg)]"
            captionLayout="dropdown"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md"
            variant={"secondary"}
          >
            취소
          </Button>

          {/* 확인 버튼 */}
          <Button
            type="button"
            onClick={onClickConfirm}
            className="rounded-md"
            disabled={!selectedDate}
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
