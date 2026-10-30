import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-obsidian/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-[440px] rounded-[24px] bg-surface border border-hairline shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-[16px] bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
            <Trash2 className="w-6 h-6 stroke-[1.8]" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3
            id="delete-dialog-title"
            className="font-sans font-semibold text-[19px] text-ink leading-snug"
          >
            Delete this article?
          </h3>
          <p className="text-[14px] text-muted leading-relaxed">
            This will permanently remove <strong className="text-ink font-medium">&ldquo;{title}&rdquo;</strong> from your site and database. This cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-5 min-h-[42px] rounded-full border border-hairline text-[14px] font-medium text-ink hover:bg-page transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 px-5 min-h-[42px] rounded-full bg-red-600 hover:bg-red-700 text-white text-[14px] font-semibold transition-colors disabled:opacity-60 shadow-sm"
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Article</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
