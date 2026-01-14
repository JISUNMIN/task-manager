"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import styles from "./style.module.scss";
import { Extension } from "@tiptap/core";
import { FileCard } from "./FileCard";
import { Skeleton } from "@/components/ui/skeleton";

const SlashCommandKeyHandler = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { from } = state.selection;
        const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
        const isSlashCommand = /\/(\w*)$/.test(textBefore);
        if (isSlashCommand) {
          if (typeof window !== "undefined") {
            const event = new CustomEvent("slash-command-enter");
            window.dispatchEvent(event);
            return true;
          }
        }
        return false;
      },
    };
  },
});

const SlashCommands = ({
  editor,
  containerRef,
}: {
  editor: any;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = [
    {
      title: "Heading 1",
      command: () => {
        deleteSlashCommand();
        editor.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      command: () => {
        deleteSlashCommand();
        editor.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      title: "Bullet List",
      command: () => {
        deleteSlashCommand();
        editor.chain().focus().toggleBulletList().run();
      },
    },
  ];

  const deleteSlashCommand = () => {
    const { state } = editor;
    const { from } = state.selection;
    const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
    const match = textBefore.match(/\/(\w*)$/);
    if (match) {
      const start = from - match[0].length;
      const end = from;
      editor.commands.deleteRange({ from: start, to: end });
    }
  };

  const updateMenu = () => {
    if (!editor) return;

    const { state, view } = editor;
    const { from } = state.selection;

    const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
    const match = textBefore.match(/\/(\w*)$/);

    if (!match) {
      setShowMenu(false);
      return;
    }

    const keyword = match[1] ?? "";
    const next = commands.filter((cmd) => cmd.title.toLowerCase().includes(keyword.toLowerCase()));

    setFiltered(next);
    setSelectedIndex(0);
    setShowMenu(true);

    const caret = view.coordsAtPos(from);
    const container = containerRef.current;

    if (container) {
      const rect = container.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 120;

      const spaceBelow = rect.bottom - caret.bottom;
      const spaceAbove = caret.top - rect.top;

      const top =
        spaceBelow < menuHeight && spaceAbove > menuHeight
          ? caret.top - rect.top - menuHeight - 6
          : caret.bottom - rect.top + 6;

      setPos({
        left: caret.left - rect.left,
        top,
      });
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showMenu) return;

      if (filtered.length === 0) {
        if (event.key === "Escape") setShowMenu(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (selectedIndex + 1) % filtered.length;
        setSelectedIndex(nextIndex);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1;
        setSelectedIndex(nextIndex);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        filtered[selectedIndex]?.command();
        setShowMenu(false);
        return;
      }

      if (event.key === "Escape") {
        setShowMenu(false);
      }
    },
    [showMenu, filtered, selectedIndex],
  );

  useEffect(() => {
    if (!editor) return;

    editor.on("update", updateMenu);
    editor.on("selectionUpdate", updateMenu);

    document.addEventListener("keydown", handleKeyDown);

    window.addEventListener("scroll", updateMenu, true);
    window.addEventListener("resize", updateMenu);

    return () => {
      editor.off("update", updateMenu);
      editor.off("selectionUpdate", updateMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateMenu, true);
      window.removeEventListener("resize", updateMenu);
    };
  }, [editor, handleKeyDown]);

  if (!showMenu) return null;

  return (
    <div
      className="absolute bg-[var(--bg-fourth)] border rounded shadow p-2 z-10"
      style={{ left: pos.left, top: pos.top }}
    >
      {filtered.length === 0 ? (
        <div className="p-1 opacity-60">No commands</div>
      ) : (
        filtered.map((item, index) => (
          <div
            key={index}
            className={`cursor-pointer p-1 hover:bg-[var(--btn-hover-bg)] ${
              index === selectedIndex ? "bg-[var(--btn-hover-bg)]" : ""
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              item.command();
              setShowMenu(false);
            }}
          >
            {item.title}
          </div>
        ))
      )}
    </div>
  );
};

// Editor 컴포넌트
export default function Editor({
  onChange,
  content,
  upload,
}: {
  onChange?: (content: string) => void;
  content?: string;
  upload: (formData: FormData) => Promise<any>;
}) {
  const [uploading, setUploading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      FileCard.configure({ draggable: true }),
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      ListItem,
      Placeholder.configure({
        placeholder: "명령어 사용시에는 '/'를 누르세요...",
      }),
      SlashCommandKeyHandler,
      Image,
    ],
    content: content ?? "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await upload(formData);
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !event.target.files) return;
    const files = Array.from(event.target.files);

    setUploading(true);

    for (const file of files) {
      try {
        const { fileUrl, fileName, fileType } = await uploadFile(file);

        if (fileType === "IMAGE") {
          // 항상 맨 위에 이미지 + 새 줄 삽입
          editor
            .chain()
            .focus()
            .insertContentAt(0, [{ type: "image", attrs: { src: fileUrl } }, { type: "paragraph" }])
            .setTextSelection(1)
            .run();
        } else {
          const fileSizeText = formatFileSize(file.size);
          editor
            .chain()
            .focus()
            .insertContentAt(0, [
              {
                type: "fileCard",
                attrs: { fileName, fileUrl, fileSize: fileSizeText },
              },
              { type: "paragraph" },
            ])
            .setTextSelection(1)
            .run();
        }
      } catch {
        alert(`${file.name} 업로드 실패`);
      }
    }

    setUploading(false);
    event.target.value = "";
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content ?? "", false);
    }
  }, [content, editor]);

  return (
    <div ref={wrapperRef} className="relative p-4">
      {editor && <SlashCommands editor={editor} containerRef={wrapperRef} />}

      {/* 업로드 버튼 */}
      <div className="mb-2 flex gap-2 items-center">
        <label className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded">
          이미지/파일 업로드
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* 업로드 중 스켈레톤 */}
      {uploading && (
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
        </div>
      )}
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}
