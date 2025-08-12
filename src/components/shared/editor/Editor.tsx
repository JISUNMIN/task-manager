"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useCallback, useEffect, useState } from "react";
import Image from "@tiptap/extension-image";
import styles from "./style.module.scss";
import { Extension } from "@tiptap/core";
import { FileCard } from "./FileCard";

const SlashCommandKeyHandler = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { from } = state.selection;
        const textBefore = state.doc.textBetween(
          Math.max(0, from - 50),
          from,
          "\n",
          "\0"
        );

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
const SlashCommands = ({ editor }: { editor: any }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [filtered, setFiltered] = useState<typeof commands>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    const textBefore = state.doc.textBetween(
      Math.max(0, from - 50),
      from,
      "\n",
      "\0"
    );
    const match = textBefore.match(/\/(\w*)$/);

    if (match) {
      const start = from - match[0].length;
      const end = from;
      editor.commands.deleteRange({ from: start, to: end });
    }
  };
  const onUpdate = () => {
    const { state } = editor;
    const { from } = state.selection;

    // 커서 앞쪽 텍스트를 일정 길이만큼 가져오기
    const textBefore = state.doc.textBetween(
      Math.max(0, from - 50),
      from,
      "\n",
      "\0"
    );

    const match = textBefore.match(/\/(\w*)$/);
    if (match) {
      const keyword = match[1];
      setShowMenu(true);
      setFiltered(
        commands.filter((cmd) =>
          cmd.title.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      setSelectedIndex(0);
    } else {
      setShowMenu(false);
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showMenu) return;

      let nextIndex = selectedIndex;
      if (event.key === "ArrowDown") {
        nextIndex = (selectedIndex + 1) % filtered.length;
      }

      if (event.key === "ArrowUp") {
        nextIndex =
          selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1;
      }

      const selectedItem = document.getElementById(`command-item-${nextIndex}`);
      if (selectedItem) {
        selectedItem.focus();
      }

      setSelectedIndex(nextIndex);

      if (event.key === "Enter") {
        event.preventDefault();
        filtered[nextIndex]?.command();
        setShowMenu(false);
      }

      if (event.key === "Escape") {
        setShowMenu(false);
      }
    },
    [showMenu, filtered, selectedIndex]
  );

  useEffect(() => {
    if (!editor) return;
    editor.on("update", onUpdate);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      editor.off("update", onUpdate);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, handleKeyDown]);

  return showMenu ? (
    <div className="absolute bg-white border rounded shadow p-2 z-10">
      {filtered.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer p-1 hover:bg-gray-100 focus:bg-gray-100"
          onClick={() => item.command()}
          tabIndex={0}
          id={`command-item-${index}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  ) : null;
};

export default function Editor({
  onChange,
  content,
  upload,
}: {
  onChange?: (content: string) => void;
  content?: string;
  upload: (formData: FormData) => Promise<any>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
          FileCard,
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
    editorProps: {
      handleDOMEvents: {
        drop: (view, event) => {
          event.preventDefault();
          return true;
        },
        dragstart: (view, event) => {
          event.preventDefault();
          return true;
        },
      },
    },
  });

  // 파일 업로드 (이미지,파일)
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return await upload(formData);
  };

  // 파일 크기 포맷 함수
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!editor) return;

      const coords = { left: event.clientX, top: event.clientY };
      const pos = editor.view.posAtCoords(coords)?.pos; // 드롭 위치

      const files = Array.from(event.dataTransfer.files);

      for (const file of files) {
        try {
          const { fileUrl, fileName, fileType } = await uploadFile(file);

          if (pos != null) {
            if (fileType === "IMAGE") {
              editor
                .chain()
                .insertContentAt(pos, {
                  type: "image",
                  attrs: { src: fileUrl },
                })
                .run();
            } else {
      const fileSizeText = formatFileSize(file.size);

editor
  .chain()
  .focus()
  .insertContentAt(
    pos, // 드롭된 위치
    {
      type: "fileCard",
      attrs: {
        fileName,
        fileUrl,
        fileSize: fileSizeText,
      },
    }
  )
  .run();
            }
          }
        } catch {
          alert(`${file.name} 업로드 실패`);
        }
      }
    },
    [editor]
  );
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content ?? "", false);
    }
  }, [content]);

  return (
    <div className="relative p-4">
      {editor && <SlashCommands editor={editor} />}
      <EditorContent
        editor={editor}
        onDrop={handleDrop}
        className={`h-full ${styles.editorContent}`}
      />
    </div>
  );
}
