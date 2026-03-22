"use client";

import Sidebar from '../../components/Navigation/Sidebar';

export default function TemplatesPage() {
    return (
        <>
            <div className="page-shell">

                <Sidebar />

                <main className="page-main">
                    <h1 className="page-title">
                        Plantillas
                    </h1>
                    <p className="page-subtitle">
                        Página de plantillas - Próximamente
                    </p>
                </main>
            </div>
        </>
    );
}