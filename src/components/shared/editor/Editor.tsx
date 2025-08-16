"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!editor) return;
    editor.on("update", onUpdate);
    return () => editor.off("update", onUpdate);
  }, [editor]);

  return showMenu ? (
    <div className="absolute bg-white border rounded shadow p-2 z-10">
      {filtered.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer p-1 hover:bg-gray-100 focus:bg-gray-100"
          onClick={() => item.command()}
          tabIndex={0}
        >
          {item.title}
        </div>
      ))}
    </div>
  ) : null;
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
      Image.configure({ draggable: true }),
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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editor || !event.target.files) return;
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        const { fileUrl, fileName, fileType } = await uploadFile(file);

        if (fileType === "IMAGE") {
          // 이미지와 새 줄을 한 번에 삽입
          editor
            .chain()
            .focus()
            .insertContent([
              {
                type: "image",
                attrs: { src: fileUrl },
              },
              {
                type: "paragraph",
              },
            ])
            // 새 단락으로 커서 이동
            .setTextSelection(editor.state.selection.to + 1)
            .run();
        } else {
          const fileSizeText = formatFileSize(file.size);
          editor
            .chain()
            .focus()
            .insertContentAt(editor.state.selection.to, {
              type: "fileCard",
              attrs: { fileName, fileUrl, fileSize: fileSizeText },
            })
            // 새 단락으로 커서 이동
            .setTextSelection(editor.state.selection.to + 1)
            .run();
        }

        // 삽입 후 커서를 새 블록 뒤로 이동
        const endPos = editor.state.selection.to + 1;
        editor.commands.setTextSelection(endPos);
        editor.commands.focus();
      } catch {
        alert(`${file.name} 업로드 실패`);
      }
    }

    event.target.value = "";
  };

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content ?? "", false);
    }
  }, [content]);

  return (
    <div className="relative p-4 h-full">
      {editor && <SlashCommands editor={editor} />}

      {/* 업로드 버튼 */}
      <div className="mb-2 flex gap-2">
        <label className="cursor-pointer px-3 py-1 bg-blue-500 text-white rounded">
          이미지/파일 업로드
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
        </label>
      </div>

      <EditorContent
        editor={editor}
        className={`h-full ${styles.editorContent}`}
      />
    </div>
  );
}
