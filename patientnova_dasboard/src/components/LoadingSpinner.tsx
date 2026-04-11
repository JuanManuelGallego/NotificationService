export function LoadingSpinner() {
    return (
        <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "var(--c-brand-accent)",
            animation: "spin 0.8s linear infinite",
        }} />
    );
}
