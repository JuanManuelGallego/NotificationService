"use client";

interface FilterBarProps {
    value: string;
    onChange: (v: string) => void;
    onClear: () => void;
    placeholder?: string;
    /** Adds filter-bar--wrap modifier for wrapping filter chips on small screens. */
    wrap?: boolean;
    children?: React.ReactNode;
}

export function FilterBar({
    value, onChange, onClear,
    placeholder = "Buscar…",
    wrap = false,
    children,
}: FilterBarProps) {
    return (
        <div className={`filter-bar${wrap ? " filter-bar--wrap" : ""}`}>
            <div className="search-wrapper">
                <input
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="form-input"
                    autoComplete="off"
                />
                <button
                    onClick={onClear}
                    className="search-clear-btn"
                    aria-label="Limpiar búsqueda"
                >✕</button>
            </div>
            {children}
        </div>
    );
}
