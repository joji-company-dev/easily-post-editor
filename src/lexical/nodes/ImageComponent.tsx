import type { LexicalEditor, NodeKey } from "lexical";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";
import { overlay } from "overlay-kit";
import { Resizable } from "re-resizable";

import * as React from "react";
import { Suspense, useRef, useState } from "react";
import { useHotKeyOSCompatible } from "../../utils/useHotKeyOSCompatible";
import { Dialog, DialogContent, DialogTitle } from "../../shadcn/dialog";

const imageCache = new Set();

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
  editable,
  onResize,
  onAlign,
  align,
  onBreakLine,
}: {
  altText: string;
  className: string | null;
  height: number | string;
  imageRef: { current: null | HTMLImageElement };
  maxWidth: number;
  editable: boolean;
  src: string;
  width: number | string;
  onResize: (width: number | string, height: number | string) => void;
  onAlign: (align: "start" | "center" | "end") => void;
  onBreakLine: () => void;
  align: "start" | "center" | "end";
}): React.JSX.Element {
  useSuspenseImage(src);

  useHotKeyOSCompatible(
    {
      key: "enter",
      options: {
        preventDefault: true,
        capture: true,
        stopPropagation: true,
      },
    },
    onBreakLine,
    !editable
  );

  const handleFullScreen = () => {
    overlay.open(({ isOpen, close }) => (
      <Dialog open={isOpen} onOpenChange={close} modal>
        <DialogContent hideOverlay>
          <DialogTitle className="sr-only">이미지</DialogTitle>
          <DialogContent className="max-w-[95vw] sm:max-w-[80vw] max-h-[95vh] p-0 border-none bg-transparent overflow-auto">
            <img
              src={src}
              alt={altText}
              onContextMenu={(e) => e.stopPropagation()}
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </DialogContent>
      </Dialog>
    ));
  };

  return (
    <Resizable
      enable={
        editable ? { top: true, right: true, bottom: true, left: true } : false
      }
      // TODO: 모바일 대응이 필요함
      size={{
        width,
      }}
      maxWidth={"100%"}
      lockAspectRatio
      handleClasses={{
        bottom: "border-t h-1 border-dashed border-primary",
        left: "border-r h-1 border-dashed border-primary",
        right: "border-l h-1 border-dashed border-primary",
        top: "border-b h-1 border-dashed border-primary",
      }}
      handleStyles={{
        bottom: {
          height: "16px",
          left: "0",
          bottom: "-18px",
        },
        top: {
          height: "16px",
          left: "0",
          top: "-18px",
        },
        left: {
          width: "16px",
          left: "-18px",
          bottom: "0",
        },
        right: {
          width: "16px",
          right: "-18px",
          bottom: "0",
        },
        bottomLeft: {
          width: "4px",
          height: "4px",
          left: "0",
          bottom: "0",
        },
      }}
      onResize={(event, direction, elementRef, delta) => {
        const parentWidth = elementRef.parentElement?.offsetWidth || 0;
        const widthPercent = (elementRef.offsetWidth / parentWidth) * 100;

        // onResize(elementRef.offsetWidth, "inherit");
        onResize(`${widthPercent}%`, "inherit");
      }}
    >
      <img
        className={className || undefined}
        src={src}
        alt={altText}
        ref={imageRef}
        style={{
          height: "100%",
          width: "100%",
        }}
        onDoubleClick={handleFullScreen}
      />
      {editable && (
        <div className="absolute top-2 right-2 bg-white rounded shadow p-1 flex gap-1">
          <button
            onMouseDownCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAlign("start");
            }}
            className={`p-1 hover:bg-gray-100 rounded ${
              align === "start" ? "bg-gray-200" : ""
            }`}
          >
            <AlignLeftIcon className="w-4 h-4" />
          </button>
          <button
            onMouseDownCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAlign("center");
            }}
            className={`p-1 hover:bg-gray-100 rounded ${
              align === "center" ? "bg-gray-200" : ""
            }`}
          >
            <AlignCenterIcon className="w-4 h-4" />
          </button>
          <button
            onMouseDownCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAlign("end");
            }}
            className={`p-1 hover:bg-gray-100 rounded ${
              align === "end" ? "bg-gray-200" : ""
            }`}
          >
            <AlignRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </Resizable>
  );
}

export default function ImageComponent({
  src,
  altText,
  resizable,
  width,
  height,
  align,
  maxWidth,
  onResize,
  onDelete,
  onAlign,
  onBreakLine,
}: {
  altText: string;
  caption: LexicalEditor;
  height: number | string;
  maxWidth: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  src: string;
  width: number | string;
  captionsEnabled: boolean;
  align: "start" | "center" | "end";
  onResize: (width: number | string, height: number | string) => void;
  onDelete: () => void;
  onAlign: (align: "start" | "center" | "end") => void;
  onBreakLine: () => void;
}): React.JSX.Element {
  const [isSelected, setIsSelected] = useState(false);
  const imageRef = useRef<null | HTMLImageElement>(null);

  useHotKeyOSCompatible(
    {
      key: "delete",
    },
    onDelete,
    !isSelected
  );

  return (
    <Suspense fallback={null}>
      <>
        <div className="relative">
          <div
            className={`flex justify-${align}`}
            tabIndex={0}
            onFocus={() => {
              setIsSelected(true);
            }}
            onBlur={() => {
              setIsSelected(false);
            }}
          >
            <LazyImage
              className={""}
              src={src}
              altText={altText}
              imageRef={imageRef}
              width={width}
              height={height}
              maxWidth={maxWidth}
              editable={isSelected && resizable}
              onResize={onResize}
              onAlign={onAlign}
              onBreakLine={onBreakLine}
              align={align}
            />
          </div>
        </div>
      </>
    </Suspense>
  );
}
