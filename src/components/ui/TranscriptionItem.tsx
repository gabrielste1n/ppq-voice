import React from "react";
import { Button } from "./button";
import { Copy, Trash2 } from "lucide-react";
import type { TranscriptionItem as TranscriptionItemType } from "../../types/electron";

interface TranscriptionItemProps {
  item: TranscriptionItemType;
  index: number;
  total: number;
  onCopy: (text: string) => void;
  onDelete: (id: number) => void;
}

export default function TranscriptionItem({
  item,
  index,
  total,
  onCopy,
  onDelete,
}: TranscriptionItemProps) {
  const timestampDate = item.timestamp
    ? new Date(`${item.timestamp}Z`)
    : new Date();

  return (
    <div className="relative bg-gradient-to-b from-accent/30 to-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 pl-16" style={{ paddingTop: "8px" }}>
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-3">
            <div
              className="flex items-center gap-2 mb-1"
              style={{ marginTop: "2px", lineHeight: "24px" }}
            >
              <span className="text-primary text-xs font-medium">
                #{total - index}
              </span>
              <div className="w-px h-3 bg-border" />
              <span className="text-xs text-muted-foreground">
                {timestampDate.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p
              className="text-foreground text-sm"
              style={{
                fontFamily:
                  'Noto Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                lineHeight: "24px",
                textAlign: "left",
                marginTop: "2px",
                paddingBottom: "2px",
              }}
            >
              {item.text}
            </p>
          </div>
          <div
            className="flex gap-1 flex-shrink-0"
            style={{ marginTop: "2px" }}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onCopy(item.text)}
              className="h-7 w-7"
            >
              <Copy size={12} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-7 w-7 text-destructive hover:text-destructive-hover hover:bg-destructive/10"
            >
              <Trash2 size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
