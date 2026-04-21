"use client";

import React from "react";
import { useFocusTrap } from "@/src/hooks/useFocusTrap";

interface ConfirmDialogProps {
    icon: string;
    title: string;
    children: React.ReactNode;
    cancelLabel?: string;
    confirmLabel: string;
    loadingLabel?: string;
    loading?: boolean;
    error?: string | null;
    /** Use when the dialog opens on top of another overlay (adds modal-overlay--nested class). */
    nested?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmDialog({
    icon, title, children,
    cancelLabel = "Regresar",
    confirmLabel, loadingLabel,
    loading = false, error = null,
    nested = false,
    onClose, onConfirm,
}: ConfirmDialogProps) {
    const { ref: trapRef, handleKeyDown: trapKeyDown } = useFocusTrap<HTMLDivElement>();
    return (
        <div className={`modal-overlay${nested ? " modal-overlay--nested" : ""}`} onClick={onClose} role="alertdialog" aria-modal="true" aria-label={title} ref={trapRef} onKeyDown={trapKeyDown}>
            <div className="modal-panel modal-panel--sm" onClick={e => e.stopPropagation()}>
                <div className="modal-confirm">
                    <div className="modal-confirm__icon">{icon}</div>
                    <h2 className="modal-title modal-title--sm">{title}</h2>
                    {children}
                </div>
                {error && <div className="error-inline">⚠️ {error}</div>}
                <div className="modal-confirm__actions">
                    <button onClick={onClose} className="btn-secondary btn-block" disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="btn-danger btn-block">
                        {loading ? (loadingLabel ?? `${confirmLabel}…`) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
