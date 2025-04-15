"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useCallback, useEffect, useState } from "react";
import "./style.css";

const SlashCommands = ({ editor }: { editor: any }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [filtered, setFiltered] = useState<typeof commands>([]);

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
          className="cursor-pointer p-1 hover:bg-gray-100"
          onClick={() => item.command()}
        >
          {item.title}
        </div>
      ))}
    </div>
  ) : null;
};

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      ListItem,
      // Placeholder.configure({
      //   placeholder: 'Type "/" for commands...',
      // }),
    ],
    content: "",
  });

  return (
    <div className="relative border p-4 rounded">
      {editor && <SlashCommands editor={editor} />}
      <EditorContent
        editor={editor}
        className="min-h-[150px] focus:outline-none"
      />
    </div>
  );
}
