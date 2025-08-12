import React, { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectBoxProps<T extends string | number> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
  renderOption?: (option: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectBox<T extends string | number>({
  options,
  value,
  onChange,
  renderOption,
  placeholder = "선택하세요",
  className = "",
  disabled = false,
}: SelectBoxProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % options.length);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev === 0 ? options.length - 1 : prev - 1
      );
      e.preventDefault();
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        onChange(options[highlightedIndex]);
        setOpen(false);
        setHighlightedIndex(-1);
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full max-w-xs",
        className,
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className=" w-full flex justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm
    hover:border-blue-500
    dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
    dark:hover:border-blue-400
    dark:focus:ring-blue-400"
      >
        <span
          className={`${value ? "text-gray-900" : "text-gray-400"} dark:text-gray-100 dark:placeholder:text-gray-400`}
        >
          {value ? (renderOption ? renderOption(value) : value) : placeholder}
        </span>
        <svg
          className={`ml-2 h-5 w-5 transition-transform ${open ? "rotate-180" : ""} dark:text-gray-100`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg text-sm
                     dark:bg-gray-900 dark:border-gray-700 dark:shadow-lg"
        >
          {options.map((option, idx) => {
            const isSelected = option === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={option.toString()}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setHighlightedIndex(-1);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 select-none transition-colors",
                  isHighlighted ? "bg-blue-100 dark:bg-blue-900" : "",
                  isSelected
                    ? "font-semibold text-blue-700 dark:text-blue-400"
                    : "text-gray-900 dark:text-gray-100",
                  "hover:bg-blue-100 dark:hover:bg-blue-900"
                )}
              >
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
                <span>{renderOption ? renderOption(option) : option}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
