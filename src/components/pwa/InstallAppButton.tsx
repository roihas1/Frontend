import { ArrowDownTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { useShowBottomNav } from "../../hooks/useShowBottomNav";
import { glassChipClassName } from "../common/glassSheet";
import { useEffect, useState } from "react";

const IOS_HINT_KEY = "pwa_ios_install_hint_dismissed";

const InstallAppButton = () => {
  const { isInstallAvailable, promptInstall, showIosManualInstallHint } =
    useInstallPrompt();
  const showBottomNav = useShowBottomNav();
  const [iosHintOpen, setIosHintOpen] = useState(false);
  const bottomClass = showBottomNav
    ? "bottom-nav-offset xl:bottom-4"
    : "bottom-4";

  useEffect(() => {
    if (!showIosManualInstallHint) return;
    try {
      setIosHintOpen(!localStorage.getItem(IOS_HINT_KEY));
    } catch {
      setIosHintOpen(true);
    }
  }, [showIosManualInstallHint]);

  const dismissIosHint = () => {
    try {
      localStorage.setItem(IOS_HINT_KEY, "1");
    } catch {
      /* ignore */
    }
    setIosHintOpen(false);
  };

  if (isInstallAvailable) {
    return (
      <div className={`fixed ${bottomClass} right-4 z-50 print:hidden`}>
        <button
          type="button"
          onClick={() => void promptInstall()}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-colors-nba-blue transition-colors active:bg-black/5 ${glassChipClassName}`}
        >
          <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
          Install app
        </button>
      </div>
    );
  }

  if (showIosManualInstallHint && iosHintOpen) {
    return (
      <div
        className={`fixed ${bottomClass} left-3 right-3 z-50 print:hidden sm:left-auto sm:right-4 sm:max-w-md sm:ml-auto`}
      >
        <div
          className={`flex items-start gap-3 rounded-2xl px-3.5 py-3 ${glassChipClassName}`}
        >
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-colors-nba-blue/10 text-colors-nba-blue">
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-sm text-gray-800">
            On iPhone, tap the{" "}
            <strong className="whitespace-nowrap text-colors-nba-blue">
              Share
            </strong>{" "}
            button{" "}
            <span className="text-gray-500">(square with arrow)</span>, then{" "}
            <strong className="text-colors-nba-blue">Add to Home Screen</strong>
            .
          </p>
          <button
            type="button"
            aria-label="close"
            onClick={dismissIosHint}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 active:bg-black/5"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallAppButton;
