import React, { Suspense } from "react";
import KanbanBoard from "./KanbanBoard"; // KanbanBoard 컴포넌트를 import

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanbanBoard /> {/* KanbanBoard 컴포넌트를 페이지에 렌더링 */}
    </Suspense>
  );
};

export default Page;
