export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
        </div>
    );
}

export function Row({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 13, color: "#6B7280", minWidth: 80 }}>{label}</span>
            <span style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{value}</span>
        </div>
    );
}
