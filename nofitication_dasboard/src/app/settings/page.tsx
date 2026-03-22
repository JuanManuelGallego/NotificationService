"use client";

import Sidebar from '../../components/Navigation/Sidebar';

export default function SettingsPage() {
    return (
        <>
            <div className="page-shell">

                <Sidebar />

                <main className="page-main">
                    <h1 className="page-title">
                        Configuración
                    </h1>
                    <p className="page-subtitle">
                        Página de configuración - Próximamente
                    </p>
                </main>
            </div>
        </>
    );
}