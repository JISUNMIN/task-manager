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
    <div
      className={`transition-transform transform  ${isTaskInfoPanelOpen ? "translate-x-0" : "translate-x-full"} fixed inset-0 left-auto right-0 md:w-[20vw] w-full `}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={togglePanel}
        className="absolute top-4 left-4 p-2 text-gray-600 cursor-pointer"
      >
        <FaAngleDoubleRight className="w-6 h-6" />
      </button>
      <div className="w-[20vw] bg-green-50 p-4 h-full flex flex-col overflow-y-auto "></div>
    </div>
  );
};

export default TaskInfoPanel;
