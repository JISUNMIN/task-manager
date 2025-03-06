import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { FaAngleDoubleRight } from "react-icons/fa";

<FaAngleDoubleRight className="w-6 h-6" />;

interface TaskInfoPanelProps {
  isTaskInfoPanelOpen: boolean;
  togglePanel: () => void;
}

const TaskInfoPanel: React.FC<TaskInfoPanelProps> = ({
  isTaskInfoPanelOpen,
  togglePanel,
}) => {
  return (
    <ResizablePanel
      defaultSize={25}
      minSize={isTaskInfoPanelOpen ? 30 : 0}
      maxSize={!isTaskInfoPanelOpen ? 0 : 50}
      className={`min-h-screen bg-green-50 transition-transform transform  ${isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"}  `}
    >
      {/* 닫기 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePanel}
        className="text-gray-600 ml-2"
      >
        <FaAngleDoubleRight className="w-6 h-6" />
      </Button>
      <div className=" p-4 h-full flex flex-col overflow-y-auto ">
        <Input
          className="border-0 h-12 placeholder:text-lg"
          placeholder="추가할 작업을 입력하세요"
        />
        <Textarea />
      </div>
    </ResizablePanel>
  );
};

export default TaskInfoPanel;
