import React from "react";

type HighlightAccent = "champion" | "mvp";

interface HighlightPickCardProps {
  id: string;
  title: string;
  accent: HighlightAccent;
  complete: boolean;
  error?: string;
  children: React.ReactNode;
}

const ACCENT: Record<HighlightAccent, { header: string; bar: string }> = {
  champion: {
    header: "bg-yellow-50 text-yellow-900",
    bar: "border-l-colors-nba-yellow",
  },
  mvp: {
    header: "bg-amber-50 text-amber-900",
    bar: "border-l-amber-400",
  },
};

function CompleteMark() {
  return (
    <span
      className="inline-flex size-5 items-center justify-center rounded-full bg-colors-nba-green text-white"
      aria-label="Complete"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-3.5"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

const HighlightPickCard: React.FC<HighlightPickCardProps> = ({
  id,
  title,
  accent,
  complete,
  error,
  children,
}) => {
  const styles = ACCENT[accent];

  return (
    <section
      id={id}
      className={`overflow-hidden rounded-2xl border border-l-4 bg-white shadow-sm ${styles.bar} ${
        error ? "border-colors-nba-red ring-2 ring-colors-nba-red/30" : "border-gray-200"
      }`}
    >
      <header className={`flex items-center justify-between gap-2 px-3 py-2 ${styles.header}`}>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          {accent === "champion" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 text-yellow-700"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .982-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728"
              />
            </svg>
          )}
          {title}
        </h3>
        {complete && <CompleteMark />}
      </header>
      <div className="space-y-2 p-3">
        {children}
        {error && (
          <p role="alert" className="text-sm font-medium text-colors-nba-red">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default HighlightPickCard;
