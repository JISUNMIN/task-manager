"use client";

import { Extension } from "@tiptap/core";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { Editor as TiptapEditor, EditorContent, useEditor } from "@tiptap/react";
import { ImageIcon, List, Redo2, TextCursorInput, Undo2 } from "lucide-react";
import {
  ChangeEvent,
  ClipboardEvent as ReactClipboardEvent,
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast, ToastMode } from "@/lib/toast";

import { FileCard } from "./FileCard";
import styles from "./style.module.scss";

type UploadResponse = {
  fileName: string;
  fileType: "IMAGE" | "PDF" | "EXCEL" | "OTHER";
  fileUrl: string;
};

type SlashCommandItem = {
  title: string;
  description: string;
  searchTerms: string[];
  command: (editor: TiptapEditor) => void;
};

export type EditorSaveStatus = "idle" | "saving" | "saved" | "error";

const SlashCommandKeyHandler = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
        const isSlashCommand = /\/([\w-]*)$/.test(textBefore);

        if (isSlashCommand && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("slash-command-enter"));
          return true;
        }

        return false;
      },
    };
  },
});

const TOOLBAR_ACTIONS = [
  {
    key: "paragraph",
    label: "본문",
    icon: TextCursorInput,
    isActive: (editor: TiptapEditor) => editor.isActive("paragraph"),
    action: (editor: TiptapEditor) => editor.chain().focus().setParagraph().run(),
  },
  {
    key: "heading-1",
    label: "H1",
    icon: TextCursorInput,
    isActive: (editor: TiptapEditor) => editor.isActive("heading", { level: 1 }),
    action: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    key: "heading-2",
    label: "H2",
    icon: TextCursorInput,
    isActive: (editor: TiptapEditor) => editor.isActive("heading", { level: 2 }),
    action: (editor: TiptapEditor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    key: "bullet-list",
    label: "목록",
    icon: List,
    isActive: (editor: TiptapEditor) => editor.isActive("bulletList"),
    action: (editor: TiptapEditor) => editor.chain().focus().toggleBulletList().run(),
  },
];

const EditorToolbar = ({
  editor,
  isUploading,
  onOpenFilePicker,
  saveStatus,
}: {
  editor: TiptapEditor;
  isUploading: boolean;
  onOpenFilePicker: () => void;
  saveStatus: EditorSaveStatus;
}) => {
  const saveLabel =
    saveStatus === "saving"
      ? "저장 중..."
      : saveStatus === "saved"
        ? "저장됨"
        : saveStatus === "error"
          ? "저장 실패"
          : "편집 중";

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-third)]/80 p-2">
      {TOOLBAR_ACTIONS.map(({ key, label, icon: Icon, isActive, action }) => (
        <Button
          key={key}
          type="button"
          variant="ghost"
          size="sm"
          className={isActive(editor) ? "bg-[var(--btn-hover-bg)] text-[var(--foreground)]" : ""}
          onClick={() => action(editor)}
        >
          <Icon className="mr-1 h-4 w-4" />
          {label}
        </Button>
      ))}

      <div className="mx-1 hidden h-6 w-px bg-[var(--border)] md:block" />

      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="mr-1 h-4 w-4" />
        실행 취소
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="mr-1 h-4 w-4" />
        다시 실행
      </Button>
      <Button type="button" size="sm" disabled={isUploading} onClick={onOpenFilePicker}>
        <ImageIcon className="mr-1 h-4 w-4" />
        이미지/파일 업로드
      </Button>

      <span
        className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
          saveStatus === "error"
            ? "bg-red-100 text-red-700"
            : saveStatus === "saved"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-[var(--btn-hover-bg)] text-[var(--text-base)]"
        }`}
      >
        {saveLabel}
      </span>
    </div>
  );
};

const SlashCommands = ({
  editor,
  containerRef,
}: {
  editor: TiptapEditor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const commands = useMemo<SlashCommandItem[]>(
    () => [
      {
        title: "본문",
        description: "기본 문단으로 전환",
        searchTerms: ["paragraph", "text", "body"],
        command: (currentEditor) => currentEditor.chain().focus().setParagraph().run(),
      },
      {
        title: "Heading 1",
        description: "큰 제목 추가",
        searchTerms: ["h1", "title", "heading"],
        command: (currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        title: "Heading 2",
        description: "중간 제목 추가",
        searchTerms: ["h2", "subtitle", "heading"],
        command: (currentEditor) => currentEditor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        title: "Bullet List",
        description: "불릿 목록 추가",
        searchTerms: ["list", "bullet", "todo"],
        command: (currentEditor) => currentEditor.chain().focus().toggleBulletList().run(),
      },
      {
        title: "인용문",
        description: "강조용 인용문 블록",
        searchTerms: ["blockquote", "quote"],
        command: (currentEditor) => currentEditor.chain().focus().toggleBlockquote().run(),
      },
    ],
    [],
  );

  const [showMenu, setShowMenu] = useState(false);
  const [filtered, setFiltered] = useState<SlashCommandItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteSlashCommand = useCallback(() => {
    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
    const match = textBefore.match(/\/([\w-]*)$/);

    if (!match) return;

    editor.commands.deleteRange({ from: from - match[0].length, to: from });
  }, [editor]);

  const applyCommand = useCallback(
    (item: SlashCommandItem) => {
      deleteSlashCommand();
      item.command(editor);
      setShowMenu(false);
    },
    [deleteSlashCommand, editor],
  );

  const updateMenu = useCallback(() => {
    const { from } = editor.state.selection;
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 50), from, "\n", "\0");
    const match = textBefore.match(/\/([\w-]*)$/);

    if (!match) {
      setShowMenu(false);
      return;
    }

    const keyword = match[1]?.toLowerCase() ?? "";
    const next = commands.filter((item) => {
      const haystacks = [item.title, item.description, ...item.searchTerms];
      return haystacks.some((value) => value.toLowerCase().includes(keyword));
    });

    setFiltered(next);
    setSelectedIndex((prev) => (next.length === 0 ? 0 : Math.min(prev, next.length - 1)));
    setShowMenu(true);

    const caret = editor.view.coordsAtPos(from);
    const container = containerRef.current;

    if (!container) return;

    const rect = container.getBoundingClientRect();
    const menuWidth = 280;
    const menuHeight = menuRef.current?.offsetHeight ?? 180;
    const left = Math.min(Math.max(caret.left - rect.left, 8), Math.max(rect.width - menuWidth - 8, 8));
    const spaceBelow = rect.bottom - caret.bottom;
    const top =
      spaceBelow < menuHeight
        ? Math.max(8, caret.top - rect.top - menuHeight - 6)
        : caret.bottom - rect.top + 6;

    setPos({ left, top });
  }, [commands, containerRef, editor]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!showMenu) return;

      if (filtered.length === 0) {
        if (event.key === "Escape") setShowMenu(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const item = filtered[selectedIndex];
        if (item) applyCommand(item);
        return;
      }

      if (event.key === "Escape") {
        setShowMenu(false);
      }
    },
    [applyCommand, filtered, selectedIndex, showMenu],
  );

  useEffect(() => {
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
  }, [editor, handleKeyDown, updateMenu]);

  if (!showMenu) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-20 w-[280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-fourth)] p-2 shadow-xl"
      style={{ left: pos.left, top: pos.top }}
    >
      {filtered.length === 0 ? (
        <div className="rounded-xl px-3 py-2 text-sm text-[var(--text-blur)]">일치하는 명령어가 없습니다.</div>
      ) : (
        filtered.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors ${
              index === selectedIndex ? "bg-[var(--btn-hover-bg)]" : "hover:bg-[var(--btn-hover-bg)]"
            }`}
            onMouseDown={(event) => {
              event.preventDefault();
              applyCommand(item);
            }}
          >
            <span className="text-sm font-semibold text-[var(--foreground)]">{item.title}</span>
            <span className="text-xs text-[var(--text-blur)]">{item.description}</span>
          </button>
        ))
      )}
    </div>
  );
};

export default function Editor({
  onChange,
  content,
  upload,
  saveStatus = "idle",
}: {
  onChange?: (content: string) => void;
  content?: string;
  upload: (formData: FormData) => Promise<UploadResponse>;
  saveStatus?: EditorSaveStatus;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      FileCard.configure({ draggable: true }),
      Heading.configure({ levels: [1, 2] }),
      BulletList,
      ListItem,
      Placeholder.configure({
        placeholder: "명령어를 쓰려면 '/'를 입력하고, 본문에는 회의 내용이나 작업 맥락을 적어보세요.",
      }),
      SlashCommandKeyHandler,
      Image.configure({
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
    ],
    content: content ?? "",
    editorProps: {
      attributes: {
        class: "min-h-[220px] px-1 py-2",
      },
      handleKeyDown: (_, event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange?.(currentEditor.getHTML());
    },
  });

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const insertUploadedFile = useCallback(
    (currentEditor: TiptapEditor, file: File, uploaded: UploadResponse) => {
      const currentPosition = currentEditor.state.selection.from;

      if (uploaded.fileType === "IMAGE") {
        currentEditor
          .chain()
          .focus()
          .insertContentAt(currentPosition, [
            { type: "image", attrs: { src: uploaded.fileUrl, alt: uploaded.fileName } },
            { type: "paragraph" },
          ])
          .run();
        return;
      }

      currentEditor
        .chain()
        .focus()
        .insertContentAt(currentPosition, [
          {
            type: "fileCard",
            attrs: {
              fileName: uploaded.fileName,
              fileUrl: uploaded.fileUrl,
              fileSize: formatFileSize(file.size),
            },
          },
          { type: "paragraph" },
        ])
        .run();
    },
    [],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return;

      setIsUploading(true);
      setUploadCount(files.length);

      try {
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          const uploaded = await upload(formData);
          insertUploadedFile(editor, file, uploaded);
        }
      } catch {
        showToast({
          type: ToastMode.ERROR,
          action: "CHANGE",
          content: "파일 업로드 중 문제가 발생했습니다.",
        });
      } finally {
        setIsUploading(false);
        setUploadCount(0);
      }
    },
    [editor, insertUploadedFile, upload],
  );

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    await uploadFiles(files);
    event.target.value = "";
  };

  const handlePaste = useCallback(
    async (event: ReactClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(event.clipboardData.files ?? []);
      if (files.length === 0) return;

      event.preventDefault();
      await uploadFiles(files);
    },
    [uploadFiles],
  );

  const handleDrop = useCallback(
    async (event: ReactDragEvent<HTMLDivElement>) => {
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length === 0) return;

      event.preventDefault();
      editor?.commands.focus();
      await uploadFiles(files);
    },
    [editor, uploadFiles],
  );

  const handleWrapperKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "u") {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (!editor) return;
    if (typeof content !== "string") return;
    if (content === editor.getHTML()) return;
    if (editor.isFocused) return;

    editor.commands.setContent(content, false);
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <Skeleton className="h-[220px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative rounded-3xl border border-[var(--border)] bg-[var(--box-bg)] p-4">
      <SlashCommands editor={editor} containerRef={wrapperRef} />
      <EditorToolbar
        editor={editor}
        isUploading={isUploading}
        onOpenFilePicker={() => fileInputRef.current?.click()}
        saveStatus={saveStatus}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-[var(--text-blur)]">
        <span>`/` 명령어, 붙여넣기, 드래그앤드롭 업로드를 지원합니다.</span>
        <span>{isUploading ? `${uploadCount}개 업로드 중...` : "Ctrl/Cmd + Shift + U 로 업로드"}</span>
      </div>

      {isUploading && (
        <div className="mb-4 flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-2xl" />
        </div>
      )}

      <div onPaste={handlePaste} onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} onKeyDown={handleWrapperKeyDown}>
        <EditorContent editor={editor} className={styles.editorContent} />
      </div>
    </div>
  );
}
