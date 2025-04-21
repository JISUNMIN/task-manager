"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useCallback, useEffect, useState } from "react";
import "./style.scss";
import { Extension } from "@tiptap/core";

const SlashCommandKeyHandler = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Slash 메뉴가 열려 있을 때만 처리
        if (typeof window !== "undefined") {
          const event = new CustomEvent("slash-command-enter");
          window.dispatchEvent(event);
          return true; // 기본 줄바꿈 방지
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

  // 키 이벤트 핸들러 추가
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

      // 선택된 항목에 focus를 주기
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

export default function Editor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      ListItem,
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      SlashCommandKeyHandler,
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
