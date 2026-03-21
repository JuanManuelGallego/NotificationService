import React from "react";
import { SkeletonRow } from "./Info/Skeleton";
import { thStyle } from "@/src/styles/theme";

interface DataTableProps<T> {
    /** Header label strings — also drives colSpan for the empty state row. */
    columns: string[];
    rows: T[];
    loading: boolean;
    skeletonCount?: number;
    /** Must return a `<tr key={...}>` element. */
    renderRow: (item: T, index: number) => React.ReactNode;
    /** Rendered inside `<tr><td colSpan={columns.length}>` when rows is empty and not loading. */
    emptyState?: React.ReactNode;
    /** Rendered inside the footer bar (flex row, space-between). Hidden when rows is empty. */
    footer?: React.ReactNode;
}

export function DataTable<T,>({
    columns,
    rows,
    loading,
    skeletonCount = 5,
    renderRow,
    emptyState,
    footer,
}: DataTableProps<T>) {
    return (
        <div style={{
            background: "#fff", borderRadius: 16,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
            animation: "fadeIn 0.3s ease",
        }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                        {columns.map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading && Array.from({ length: skeletonCount }).map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                    {!loading && rows.map((row, i) => renderRow(row, i))}
                    {!loading && rows.length === 0 && emptyState && (
                        <tr>
                            <td colSpan={columns.length} style={{ padding: 56, textAlign: "center" }}>
                                {emptyState}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            {!loading && rows.length > 0 && footer && (
                <div style={{
                    padding: "12px 20px", borderTop: "1px solid #F3F4F6",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#FAFAFA",
                }}>
                    {footer}
                </div>
            )}
        </div>
    );
}
