import { isMacOs } from "react-device-detect";
import { useHotKey } from "./useHotKey";

type Options = {
  main?: boolean;
  sub?: boolean;
  alt?: boolean;
  shift?: boolean;
  caseSensitive?: boolean;
  target?: HTMLElement;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  capture?: boolean;
};

interface HotkeyOptions {
  key: string;
  options?: Options;
}

export const useHotKeyOSCompatible = (
  hotkey: HotkeyOptions,
  cb: (e: KeyboardEvent) => void,
  ignore?: boolean
) => {
  const optionsForOSCompatible = {
    alt: hotkey.options?.alt,
    shift: hotkey.options?.shift,
    caseSensitive: hotkey.options?.caseSensitive,
    control: isMacOs ? hotkey.options?.sub : hotkey.options?.main,
    meta: isMacOs ? hotkey.options?.main : hotkey.options?.sub,
    target: hotkey.options?.target,
    preventDefault: hotkey.options?.preventDefault,
    stopPropagation: hotkey.options?.stopPropagation,
    capture: hotkey.options?.capture,
  };
  return useHotKey({ ...hotkey, options: optionsForOSCompatible }, cb, ignore);
};
