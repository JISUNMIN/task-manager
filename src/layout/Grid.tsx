import { ReactNode } from "react";

interface GridProps {
  /** 부모 컴포넌트가 전달한 style */
  classes?: string;
  /** Grid Item components */
  children: ReactNode;
  /** 열(column) */
  column?: number;
  /** 행(row) */
  row?: number;
  /** 타이틀 */
  title?: string;
  className?: string;
}

const Grid = ({
  classes,
  children,
  column = 1,
  row = 1,
  title,
  className,
}: GridProps) => {
  return (
    <div className={`flex flex-col items-start justify-center gap-4`}>
      {title && <p className="font-bold">{title}</p>}
      <div
        className={`grid w-full gap-5 grid-cols-${column} grid-rows-${row} ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Grid;
