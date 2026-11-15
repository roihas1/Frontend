import type { SxProps, Theme } from "@mui/material";

/** Shared MUI Paper styles for bottom glass sheets (Drawer / SwipeableDrawer). */
export const glassSheetPaperSx: SxProps<Theme> = {
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  maxHeight: "80dvh",
  backgroundColor: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(24px) saturate(1.5)",
  WebkitBackdropFilter: "blur(24px) saturate(1.5)",
  borderTop: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))":
    {
      backgroundColor: "rgba(255,255,255,0.95)",
    },
  "@media (prefers-reduced-transparency: reduce)": {
    backgroundColor: "rgba(255,255,255,0.95)",
    backdropFilter: "none",
    WebkitBackdropFilter: "none",
  },
};

/** Tailwind classes for custom (non-MUI) bottom glass panels. */
export const glassSheetPanelClassName =
  "rounded-t-3xl border-t border-white/45 bg-white/95 shadow-[0_-8px_32px_rgba(0,0,0,0.18)] supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-2xl supports-[backdrop-filter]:backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-white/95 [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none";

export const glassSheetHandleClassName =
  "mx-auto mb-3 h-1 w-10 rounded-full bg-gray-400/60";
