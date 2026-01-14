// FileCardView.tsx
import { NodeViewWrapper } from "@tiptap/react";

export default function FileCardView(props: any) {
  const { node, deleteNode } = props;
  const { fileName, fileUrl, fileSize } = node.attrs;

  return (
    <NodeViewWrapper
      as="div"
      className="file-card"
      data-drag-handle
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        background: "var(--item-bg)",
      }}
    >
      {/* 아이콘 */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          background: "var(--box-bg)",
          border: "1px solid var(--border)",
          color: "var(--text-base)",

          flex: "0 0 auto",
        }}
        aria-hidden
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M21.44 11.05l-8.49 8.49a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.19 9.19a2 2 0 01-2.83-2.83l8.49-8.49"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* 파일명/사이즈 */}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            display: "block",

            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.25,

            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {fileName}
        </a>

        <div style={{ marginTop: 6 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 999,
              fontSize: 12,
              color: "var(--muted-foreground)",
              background: "var(--muted)",
              border: "1px solid var(--border)",
            }}
          >
            {fileSize}
          </span>
        </div>
      </div>

      {/* 삭제 버튼 */}
      <button
        type="button"
        aria-label="remove file"
        style={{
          marginLeft: "auto",
          width: 32,
          height: 32,
          borderRadius: 999,
          cursor: "pointer",
          border: "1px solid var(--destructive)",
          background: "transparent",
          color: "var(--destructive)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "0 0 auto",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteNode();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </NodeViewWrapper>
  );
}
