export function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
    return (
        <div>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--c-gray-700)", marginBottom: 5 }}>{title}</div>
            <div className="text-muted">{sub}</div>
        </div>
    );
}
