// FileCard.ts
import { Node, mergeAttributes } from "@tiptap/core";

export const FileCard = Node.create({
  name: "fileCard",
  group: "block",
  atom: true, // 블록 하나를 통째로 취급 (인라인 편집 불가)
  selectable: true, // 클릭 가능
  draggable: true,  // 드래그 가
  addAttributes() {
    return {
      fileName: { default: null },
      fileUrl: { default: null },
      fileSize: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "file-card" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "file-card",
      mergeAttributes(HTMLAttributes, {
        style:
          "display:flex;align-items:center;gap:8px;padding:6px;border-radius:4px;background:#f5f5f5;max-width:400px;",
      }),
      [
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          width: "20",
          height: "20",
          fill: "currentColor",
          viewBox: "0 0 20 20",
        },
        [
          "path",
          { d: "M12.93 12.442a.625.625 ..." }, 
        ],
        [
          "path",
          { d: "M6.25 2.375A2.125 ..." },
        ],
      ],
      [
        "div",
        { style: "flex:1;" },
        [
          "div",
          {
            style:
              "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
          },
          [
            "a",
            {
              href: HTMLAttributes.fileUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              style: "text-decoration:none;color:inherit;",
            },
            HTMLAttributes.fileName,
          ],
        ],
        [
          "div",
          { style: "font-size:12px;color:#73726e;" },
          HTMLAttributes.fileSize,
        ],
      ],
      [
        "button",
        {
          style:
            "margin-left:auto;background:none;border:none;cursor:pointer;color:red;",
          onclick: "this.closest('file-card').remove()", 
        },
        "X",
      ],
    ];
  },
});
