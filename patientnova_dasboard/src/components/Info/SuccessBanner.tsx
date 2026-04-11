export function SuccessBanner({ message }: { message: string }) {
    return (
        <div style={{
            background: "var(--c-success-bg)",
            border: "1px solid var(--c-success-light)",
            borderRadius: "var(--r-xl)",
            padding: "10px 14px",
            fontSize: 13,
            color: "var(--c-success)",
            display: "flex",
            alignItems: "center",
            gap: 8,
        }}>
            ✓ {message}
        </div>
    );
}
