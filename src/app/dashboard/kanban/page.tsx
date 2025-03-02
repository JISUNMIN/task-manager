import React from "react";
import KanbanBoard from "./KanbanBoard"; // KanbanBoard 컴포넌트를 import

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <KanbanBoard /> {/* KanbanBoard 컴포넌트를 페이지에 렌더링 */}
    </div>
  );
};

export default Page;
