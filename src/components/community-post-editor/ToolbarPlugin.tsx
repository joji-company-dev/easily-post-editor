/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { ModelCreator } from "../../utils/model-creator";
import { Button } from "../../shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../shadcn/dialog";
import { Input } from "../../shadcn/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { INSERT_IMAGE_COMMAND } from "../../lexical/plugins/ImagePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Image,
  Italic,
  Redo,
  Redo2,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import { overlay } from "overlay-kit";
import { useCallback, useEffect, useRef, useState } from "react";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

interface ToolbarPluginProps {
  onUploadImage?: (file: File) => Promise<string | null>;
}

export default function ToolbarPlugin({ onUploadImage }: ToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [pasteDisabled, setPasteDisabled] = useState(false);

  useEffect(() => {
    if (pasteDisabled) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const imageFile = Array.from(e.clipboardData?.items || [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();

      if (imageFile) {
        await handleFileChange(imageFile);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [pasteDisabled]);

  const handleFileChange = async (file: File) => {
    try {
      if (pasteDisabled) return;
      setPasteDisabled(true);
      const image = await onUploadImage?.(file);
      if (!image) return;
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        src: image,
        altText: `${file.name}`,
      });
      overlay.close("image-upload");
    } finally {
      setPasteDisabled(false);
    }
  };

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <Redo size={16} />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <AlignRight size={16} />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <AlignJustify size={16} />
      </button>
      <button
        onClick={() => {
          overlay.open(
            ({ isOpen, close }) => (
              <Dialog open={isOpen} onOpenChange={close}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>이미지 업로드</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      파일 선택
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="secondary"
                          disabled={pasteDisabled}
                          onClick={() => setPasteDisabled(false)}
                        >
                          클립보드에서 붙여넣기
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              붙여넣기
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              (Ctrl/⌘) + V 를 눌러 이미지를 붙여넣어주세요.
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Input
                      ref={imageInputRef}
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await handleFileChange(file);
                        close();
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ),
            {
              overlayId: "image-upload",
            }
          );
        }}
        className="toolbar-item"
        aria-label="Insert Image"
      >
        <Image size={16} />
      </button>
    </div>
  );
}
