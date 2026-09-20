import { useEffect, useRef, useState } from "react";
import { PlusIcon, XIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  icon: LucideIcon;
  items: string[];
  label: string;
  placeholder: string;
  setItems: (items: string[]) => void;
  summary: string;
};

export const CompactEditor = ({
  icon: Icon,
  items,
  label,
  placeholder,
  setItems,
  summary,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const editor = editorRef.current;
      if (editor !== null && !editor.contains(event.target as Node)) setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div
      ref={editorRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-xs font-normal text-muted-foreground"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}>
        <Icon aria-hidden="true" className="size-3.5" />
        {summary}
      </Button>

      {(isOpen || isHovered) && (
        <div
          role="dialog"
          aria-label={`Manage ${label.toLowerCase()}`}
          className="absolute top-full left-0 z-30 mt-2 w-68 rounded-lg bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
          <p className="mb-2 text-xs font-medium">{label}</p>
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <div
                key={item}
                className="flex min-h-8 items-center gap-2 rounded-md bg-muted px-2 text-xs">
                <span
                  aria-hidden="true"
                  className={
                    index === 0
                      ? "size-2 shrink-0 rounded-full bg-primary"
                      : "size-2 shrink-0 rounded-full bg-primary/45"
                  }
                />
                <span className="min-w-0 flex-1 truncate">{item}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${item}`}
                  onClick={() => setItems(items.filter((value) => value !== item))}>
                  <XIcon aria-hidden="true" />
                </Button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="px-2 py-1 text-xs text-muted-foreground">None added.</p>
            )}
          </div>
          <form
            className="mt-2 flex gap-1.5"
            onSubmit={(event) => {
              event.preventDefault();
              const value = input.trim();
              if (!value || items.includes(value)) return;
              setItems([...items, value]);
              setInput("");
            }}>
            <Input
              value={input}
              aria-label={`Add ${label.toLowerCase()}`}
              placeholder={placeholder}
              className="h-9 text-sm"
              onChange={(event) => setInput(event.target.value)}
            />
            <Button type="submit" variant="outline" size="icon" aria-label={`Add ${label}`}>
              <PlusIcon aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
