import React, { useEffect, useRef } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { seriesDisplayLabel } from "./adminNormalize";
import SeriesDetailTabs from "./SeriesDetailTabs";
import SeriesListPanel from "./SeriesListPanel";
import type { SeriesWorkbenchModel } from "./useSeriesWorkbenchModel";

interface SeriesWorkbenchViewProps {
  model: SeriesWorkbenchModel;
}

const SeriesWorkbenchView: React.FC<SeriesWorkbenchViewProps> = ({ model }) => {
  const detailRef = useRef<HTMLElement>(null);
  const hasSelection = Boolean(model.seriesIdParam && model.selectedSeries);

  useEffect(() => {
    if (!hasSelection || !detailRef.current) return;
    // On mobile the list is hidden when a series is open; still scroll detail into view
    // when arriving via deep link or after selection on larger screens.
    const isNarrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches;
    if (isNarrow) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hasSelection, model.seriesIdParam, model.activeTab]);

  if (!model.selectedTournamentId) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        Select a tournament from the navbar to manage series.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_1fr]">
        {/* List: always on desktop; on mobile only when nothing selected */}
        <aside className={hasSelection ? "hidden lg:block" : "block"}>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-lg font-semibold">Series</h2>
            <p className="text-xs text-gray-500 lg:hidden">Tap a series to open</p>
          </div>
          <SeriesListPanel
            groupedSeries={model.groupedSeries}
            selectedSeriesId={model.seriesIdParam}
            isLoading={model.isSeriesLoading}
            onSelectSeries={model.handleSelectSeries}
            compact
          />
        </aside>

        {/* Detail: always on desktop; on mobile only when a series is selected */}
        <section
          ref={detailRef}
          className={hasSelection ? "block scroll-mt-20" : "hidden lg:block"}
        >
          {hasSelection && (
            <div className="mb-3 flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => model.handleBackToSeriesList()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← All series
              </button>
              <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                {seriesDisplayLabel(model.selectedSeries!)}
              </p>
            </div>
          )}
          <SeriesDetailTabs model={model} />
        </section>
      </div>

      <ConfirmDialog
        open={model.confirmDialog.open}
        title={model.confirmDialog.title}
        message={model.confirmDialog.message}
        confirmLabel={model.confirmDialog.confirmLabel}
        confirmColor={model.confirmDialog.confirmColor}
        loading={model.isMutating}
        onConfirm={model.handleConfirmAction}
        onCancel={model.handleCancelConfirm}
      />
    </>
  );
};

export default SeriesWorkbenchView;
