"use client";

import Sidebar from '../../components/Navigation/Sidebar';

export default function TemplatesPage() {
    return (
        <>
            <div style={{ display: "flex", minHeight: "100vh", background: "#F8F7F4", fontFamily: "'DM Sans', sans-serif" }}>

                <Sidebar />

                <main style={{ marginLeft: 240, flex: 1, padding: "36px 40px", maxWidth: "calc(100% - 240px)" }}>
                    <h1 style={{
                        fontSize: 30, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em",
                        fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 6,
                    }}>
                        Plantillas
                    </h1>
                    <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                        Página de plantillas - Próximamente
                    </p>
                </main>
            </div>
        </>
    );
}