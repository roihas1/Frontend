import GetAppIcon from "@mui/icons-material/GetApp";
import { Alert, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { useEffect, useState } from "react";

const IOS_HINT_KEY = "pwa_ios_install_hint_dismissed";

const InstallAppButton = () => {
  const { isInstallAvailable, promptInstall, showIosManualInstallHint } =
    useInstallPrompt();
  const [iosHintOpen, setIosHintOpen] = useState(false);

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
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<GetAppIcon />}
          onClick={() => void promptInstall()}
          sx={{ boxShadow: 3 }}
        >
          Install app
        </Button>
      </div>
    );
  }

  if (showIosManualInstallHint && iosHintOpen) {
    return (
      <div className="fixed bottom-4 left-3 right-3 z-50 print:hidden sm:left-auto sm:right-4 sm:max-w-md sm:ml-auto">
        <Alert
          severity="info"
          icon={<GetAppIcon />}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={dismissIosHint}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <span className="text-sm">
            On iPhone, tap the{" "}
            <strong className="whitespace-nowrap">Share</strong> button{" "}
            <span className="opacity-90">(square with arrow)</span>, then{" "}
            <strong>Add to Home Screen</strong>. Apple does not allow an
            Install button here like on Android.
          </span>
        </Alert>
      </div>
    );
  }

  return null;
};

export default InstallAppButton;
