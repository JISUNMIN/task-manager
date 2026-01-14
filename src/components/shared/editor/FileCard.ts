// FileCard.ts
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FileCardView from "./FileCardView";

export const FileCard = Node.create({
  name: "fileCard",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

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
    return ["file-card", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileCardView);
  },
});
