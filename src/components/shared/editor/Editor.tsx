"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import { useCallback, useEffect, useState, useRef } from "react";
import styles from "./style.module.scss";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { v4 as uuidv4 } from "uuid";

// debounce 함수 (localStorage 저장 제한용)
function debounce<Func extends (...args: any[]) => void>(
  func: Func,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<Func>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
            return true; // 기본 줄바꿈 방지
          }
        }
        return false;
      },
    };
  },
});

const SlashCommands = ({ editor }: { editor: any }) => {
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

  const [showMenu, setShowMenu] = useState(false);
  const [filtered, setFiltered] = useState<typeof commands>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

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

  const updateMenuPosition = () => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const editorRect = editor.view.dom.getBoundingClientRect();

    setPosition({
      top: coords.bottom - editorRect.top + editor.view.dom.scrollTop,
      left: coords.left - editorRect.left + editor.view.dom.scrollLeft,
    });
  };

  const onUpdate = () => {
    if (!editor) return;

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

      updateMenuPosition();
    } else {
      setShowMenu(false);
      setPosition(null);
    }
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showMenu) return;

      let nextIndex = selectedIndex;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        nextIndex = (selectedIndex + 1) % filtered.length;
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        nextIndex = selectedIndex === 0 ? filtered.length - 1 : selectedIndex - 1;
      } else if (event.key === "Enter") {
        event.preventDefault();
        filtered[nextIndex]?.command();
        setShowMenu(false);
        return;
      } else if (event.key === "Escape") {
        setShowMenu(false);
        return;
      } else {
        return;
      }

      const selectedItem = document.getElementById(`command-item-${nextIndex}`);
      if (selectedItem) {
        selectedItem.focus();
      }

      setSelectedIndex(nextIndex);
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

  if (!showMenu || !position) return null;

  return (
    <div
      className="absolute z-10 p-2 rounded border bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map((item, index) => (
        <div
          key={index}
          className="cursor-pointer p-1 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 rounded outline-none"
          onClick={() => {
            item.command();
            setShowMenu(false);
          }}
          tabIndex={0}
          id={`command-item-${index}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  );
};

export default function Editor() {
  const [uploadingFiles, setUploadingFiles] = useState<
    {
      id: string;
      fileName: string;
      status: "uploading" | "done" | "error";
      previewUrl?: string;
    }[]
  >([]);
  const [content, setContent] = useState<string>("");

  // debounce 된 저장 함수 (localStorage 저장 제한용)
  const saveContentToLocalStorage = useRef(
    debounce((html: string) => {
      try {
        localStorage.setItem("kanban-store", html);
      } catch (e) {
        console.warn("localStorage 저장 실패:", e);
      }
    }, 1000)
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      ListItem,
      Placeholder.configure({
        placeholder: "명령어 사용시에는 '/'를 누르세요...",
      }),
      SlashCommandKeyHandler,
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      saveContentToLocalStorage.current(html);
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

  // 이미지 업로드 예시 (로컬 URL 생성)
  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        resolve(url);
      }, 1500);
    });
  };

  // 파일 업로드 (이미지 외 파일용, 서버 업로드용 예시)
  const uploadFile = async (file: File): Promise<string> => {
    // 실제 서버 API 호출 코드로 바꾸세요
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("파일 업로드 실패");
    }

    const data = await response.json();
    return data.fileUrl; // 서버가 반환하는 파일 URL
  };

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!editor) return;

      const files = Array.from(event.dataTransfer.files);

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          // 이미지 처리
          const id = uuidv4();
          setUploadingFiles((prev) => [
            ...prev,
            { id, fileName: file.name, status: "uploading" },
          ]);
          try {
            const url = await uploadImage(file);
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: "done", previewUrl: url } : f
              )
            );
            editor
              .chain()
              .focus()
              .setImage({ src: url })
              .createParagraphNear()
              .focus()
              .run();
          } catch {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: "error" } : f))
            );
          }
        } else if (
          [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
          ].includes(file.type) ||
          /\.(pdf|xlsx|xls|docx|doc)$/i.test(file.name)
        ) {
          // PDF, 엑셀, 워드 등 파일 처리
          const id = uuidv4();
          setUploadingFiles((prev) => [
            ...prev,
            { id, fileName: file.name, status: "uploading" },
          ]);
          try {
            const url = await uploadFile(file);
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === id ? { ...f, status: "done", previewUrl: url } : f
              )
            );
            editor
              .chain()
              .focus()
              .insertContent(
                `<a href="${url}" target="_blank" rel="noopener noreferrer">${file.name}</a><p></p>`
              )
              .run();
          } catch {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: "error" } : f))
            );
          }
        } else {
          alert(`${file.name} 형식은 지원하지 않습니다.`);
        }
      }
    },
    [editor]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 페이지 로드 시 localStorage에서 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kanban-store");
      if (saved) setContent(saved);
    } catch (e) {
      console.warn("localStorage 불러오기 실패:", e);
    }
  }, []);

  return (
    <div className="relative p-4 h-full">
      {editor && <SlashCommands editor={editor} />}
      <EditorContent
        editor={editor}
        className={`h-full ${styles.editorContent}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      />

      {/* 업로드 상태 UI */}
      {uploadingFiles.length > 0 && (
        <div className="fixed bottom-4 right-4 w-72 bg-white border rounded shadow p-3 space-y-2 z-50">
          {uploadingFiles.map(({ id, fileName, status }) => (
            <div
              key={id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <span className="truncate">{fileName}</span>
              {status === "uploading" && (
                <div className="animate-pulse text-blue-600 font-semibold">
                  업로드 중...
                </div>
              )}
              {status === "error" && (
                <div className="text-red-600 font-semibold">업로드 실패</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
