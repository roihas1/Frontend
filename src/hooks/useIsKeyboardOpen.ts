import { useEffect, useState } from "react";

const NON_TEXT_INPUT_TYPES = new Set([
  "checkbox",
  "radio",
  "button",
  "submit",
  "reset",
  "range",
  "file",
  "color",
  "hidden",
  "image",
]);

const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  if (target instanceof HTMLTextAreaElement) {
    return true;
  }

  if (target instanceof HTMLInputElement) {
    const type = (target.getAttribute("type") ?? "text").toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type);
  }

  return false;
};

export const useIsKeyboardOpen = (): boolean => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    let focusOutTimer: number | null = null;

    const clearFocusOutTimer = () => {
      if (focusOutTimer !== null) {
        window.clearTimeout(focusOutTimer);
        focusOutTimer = null;
      }
    };

    const updateFromViewport = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        return;
      }
      const isViewportShrunk = viewport.height < window.innerHeight * 0.75;
      if (isViewportShrunk) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      clearFocusOutTimer();
      if (isTextEntryTarget(event.target)) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      clearFocusOutTimer();
      focusOutTimer = window.setTimeout(() => {
        const active = document.activeElement;
        if (isTextEntryTarget(active)) {
          setIsKeyboardOpen(true);
          return;
        }
        const viewport = window.visualViewport;
        const isViewportShrunk =
          !!viewport && viewport.height < window.innerHeight * 0.75;
        setIsKeyboardOpen(isViewportShrunk);
      }, 150);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    window.visualViewport?.addEventListener("resize", updateFromViewport);

    return () => {
      clearFocusOutTimer();
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.visualViewport?.removeEventListener("resize", updateFromViewport);
    };
  }, []);

  return isKeyboardOpen;
};
