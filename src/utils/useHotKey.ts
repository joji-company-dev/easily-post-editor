import { useEffect, useState } from "react";

type Options = {
  meta?: boolean;
  control?: boolean;
  alt?: boolean;
  shift?: boolean;
  caseSensitive?: boolean;
  target?: HTMLElement;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  capture?: boolean;
};

export interface HotKeyOptions {
  key: string;
  options?: Options;
}

export const useHotKey = (
  { key, options }: HotKeyOptions,
  cb: (e: KeyboardEvent) => void,
  ignore?: boolean
) => {
  const [isHotkeyPressed, setIsHotkeyPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return;
      if (!options?.target) {
        // Ignore typing in input fields
        if (e.target instanceof HTMLInputElement) return;
        // Ignore typing in textarea fields
        if (e.target instanceof HTMLTextAreaElement) return;
        // Ignore typing in contenteditable fields
        if (e.target instanceof HTMLElement && e.target.isContentEditable)
          return;
      }

      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      if (!!options?.caseSensitive && e.key !== key) return;
      if (!!options?.meta !== e.metaKey) return;
      if (!!options?.control !== e.ctrlKey) return;
      if (!!options?.alt !== e.altKey) return;
      if (!!options?.shift !== e.shiftKey) return;
      if (ignore) return;

      if (options?.preventDefault) {
        e.preventDefault();
      }
      if (options?.stopPropagation) {
        e.stopPropagation();
      }

      setIsHotkeyPressed(true);
      cb(e);
    };

    const handleKeyUp = (e: Event) => {
      setIsHotkeyPressed(false);
    };
    if (ignore) return;
    const target = options?.target ?? document;
    target.addEventListener("keydown", handleKeyDown, {
      capture: options?.capture,
    });
    target.addEventListener("keyup", handleKeyUp, {
      capture: options?.capture,
    });
    return () => {
      target.removeEventListener("keydown", handleKeyDown, {
        capture: options?.capture,
      });
      target.removeEventListener("keyup", handleKeyUp, {
        capture: options?.capture,
      });
    };
  }, [key, options, ignore, cb]);

  return isHotkeyPressed;
};
