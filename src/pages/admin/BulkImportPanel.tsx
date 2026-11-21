import React, { useRef, useState } from "react";
import {
  AdminFormCard,
  adminControlClass,
  adminPrimaryBtnClass,
  adminSecondaryBtnClass,
} from "./AdminFormPrimitives";
import {
  downloadCsvTemplate,
  rowsFromDelimitedText,
  rowsFromFile,
  rowsToCsv,
} from "./sheetImport";

export interface BulkImportPanelProps {
  title: string;
  description: string;
  templateFilename: string;
  templateHeaders: string[];
  templateSample: string[][];
  disabled?: boolean;
  submitting?: boolean;
  onParseRows: (rows: Record<string, string>[]) => {
    validCount: number;
    errorCount: number;
    errors: { rowNumber: number; error: string }[];
    preview: string[];
  };
  onSubmitValid: () => Promise<void> | void;
}

type ParseSummary = {
  validCount: number;
  errorCount: number;
  errors: { rowNumber: number; error: string }[];
  preview: string[];
};

const BulkImportPanel: React.FC<BulkImportPanelProps> = ({
  title,
  description,
  templateFilename,
  templateHeaders,
  templateSample,
  disabled = false,
  submitting = false,
  onParseRows,
  onSubmitValid,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editorText, setEditorText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [dirtySinceValidate, setDirtySinceValidate] = useState(false);
  const [parseSummary, setParseSummary] = useState<ParseSummary | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const clearFileInput = () => {
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const resetAll = () => {
    setEditorText("");
    setFileName(null);
    setParseSummary(null);
    setLocalError(null);
    setDirtySinceValidate(false);
    setIsEditing(true);
    clearFileInput();
  };

  const applyRows = (rows: Record<string, string>[], sourceLabel: string) => {
    if (rows.length === 0) {
      setParseSummary(null);
      setLocalError(`No data rows found in ${sourceLabel}.`);
      return;
    }
    setLocalError(null);
    setParseSummary(onParseRows(rows));
    setDirtySinceValidate(false);
    setIsEditing(false);
  };

  const validateText = (text: string, sourceLabel: string) => {
    try {
      const rows = rowsFromDelimitedText(text);
      applyRows(rows, sourceLabel);
    } catch (error) {
      setParseSummary(null);
      setLocalError(
        error instanceof Error ? error.message : "Couldn't parse the data.",
      );
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    try {
      const rows = await rowsFromFile(file);
      const csv = rowsToCsv(rows, templateHeaders);
      setEditorText(csv);
      applyRows(rows, file.name);
    } catch (error) {
      setParseSummary(null);
      setLocalError(
        error instanceof Error
          ? error.message
          : "Couldn't read that file. Use .csv or .xlsx.",
      );
    }
  };

  const openFilePicker = () => {
    clearFileInput();
    fileRef.current?.click();
  };

  const handleEditorChange = (value: string) => {
    setEditorText(value);
    setDirtySinceValidate(true);
    if (fileName) {
      setFileName(`${fileName.replace(/\s\(edited\)$/, "")} (edited)`);
    }
  };

  const canSubmit =
    !!parseSummary &&
    parseSummary.validCount > 0 &&
    parseSummary.errorCount === 0 &&
    !dirtySinceValidate;

  const hasData = Boolean(editorText.trim() || fileName || parseSummary);

  return (
    <AdminFormCard title={title} description={description}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={adminSecondaryBtnClass}
          disabled={disabled || submitting}
          onClick={() =>
            downloadCsvTemplate(
              templateFilename,
              templateHeaders,
              templateSample,
            )
          }
        >
          Download template
        </button>
        <button
          type="button"
          className={adminSecondaryBtnClass}
          disabled={disabled || submitting}
          onClick={openFilePicker}
        >
          {hasData ? "Re-upload CSV / Excel" : "Upload CSV / Excel"}
        </button>
        {hasData && (
          <button
            type="button"
            className={adminSecondaryBtnClass}
            disabled={disabled || submitting}
            onClick={resetAll}
          >
            Clear
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {fileName && (
        <p className="text-xs text-gray-500">
          Source: {fileName}
          {dirtySinceValidate ? " · unsaved edits — re-validate before create" : ""}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-700">
          Spreadsheet data
        </label>
        <div className="flex flex-wrap gap-2">
          {!isEditing && (
            <button
              type="button"
              className={adminSecondaryBtnClass}
              disabled={disabled || submitting}
              onClick={() => setIsEditing(true)}
            >
              Edit data
            </button>
          )}
          {isEditing && (
            <button
              type="button"
              className={adminSecondaryBtnClass}
              disabled={disabled || submitting || !editorText.trim()}
              onClick={() => validateText(editorText, fileName ?? "edited data")}
            >
              Validate
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editorText}
          onChange={(e) => handleEditorChange(e.target.value)}
          disabled={disabled || submitting}
          rows={8}
          className={`${adminControlClass} font-mono text-xs`}
          placeholder={templateHeaders.join(",")}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          Data locked after validation. Click <span className="font-medium">Edit data</span>{" "}
          to change rows, or <span className="font-medium">Re-upload</span> a new file.
        </div>
      )}

      {localError && <p className="text-sm text-red-600">{localError}</p>}

      {parseSummary && (
        <div
          className={`space-y-2 rounded-lg border p-3 text-sm ${
            dirtySinceValidate
              ? "border-amber-200 bg-amber-50"
              : parseSummary.errorCount > 0
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
          }`}
        >
          {dirtySinceValidate ? (
            <p className="font-medium text-amber-900">
              Edited since last validation — click Validate again.
            </p>
          ) : (
            <p>
              <span className="font-semibold text-emerald-800">
                {parseSummary.validCount} valid
              </span>
              {parseSummary.errorCount > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-red-700">
                    {parseSummary.errorCount} need fixes
                  </span>
                </>
              )}
            </p>
          )}
          {parseSummary.preview.length > 0 && (
            <ul className="list-inside list-disc text-gray-700">
              {parseSummary.preview.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {parseSummary.errors.length > 0 && !dirtySinceValidate && (
            <ul className="list-inside list-disc text-red-700">
              {parseSummary.errors.slice(0, 8).map((err) => (
                <li key={`${err.rowNumber}-${err.error}`}>
                  Row {err.rowNumber}: {err.error}
                </li>
              ))}
              {parseSummary.errors.length > 8 && (
                <li>…and {parseSummary.errors.length - 8} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        className={`${adminPrimaryBtnClass} w-full sm:w-auto`}
        disabled={!canSubmit || disabled || submitting}
        onClick={() => void onSubmitValid()}
      >
        {submitting
          ? "Creating…"
          : `Create ${parseSummary?.validCount ?? 0} row(s)`}
      </button>
    </AdminFormCard>
  );
};

export default BulkImportPanel;
