export function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
    return (
        <div className="error-banner">
            <span className="error-banner__text">⚠️ {msg}</span>
            <button onClick={onRetry} className="btn-danger btn-sm">Reintentar</button>
        </div>
    );
}
