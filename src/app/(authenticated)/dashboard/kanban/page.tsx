import React, { Suspense } from "react";
import KanbanBoard from "./board/KanbanBoard"; // KanbanBoard 컴포넌트를 import
import Loading from "@/app/loading";

const Page = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="min-h-screen bg-gray-50">
        {/* KanbanBoard 컴포넌트를 페이지에 렌더링 */}
        <KanbanBoard />
      </div>
    </Suspense>
  );
};

export default Page;
