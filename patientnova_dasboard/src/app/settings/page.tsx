"use client";

import { useState } from "react";
import PageLayout from "@/src/components/PageLayout";
import { PageHeader } from "@/src/components/PageHeader";
import { ProfileTab } from "./profileTab";
import { SecurityTab } from "./securityTab";

enum ActiveTab { Profile = "👤 Perfil", Security = "🔒 Seguridad" }

export default function SettingsPage() {
    const [ tab, setTab ] = useState<ActiveTab>(ActiveTab.Profile);

    return (
        <PageLayout>
            <PageHeader
                title="Configuración"
                subtitle="Gestiona tu perfil y seguridad"
                style={{ marginBottom: 28 }}
            />
            <div className="tab-nav" style={{ width: "fit-content", marginBottom: 28 }}>
                <button className={`filter-chip ${tab === ActiveTab.Profile ? "filter-chip--active" : ""}`} onClick={() => setTab(ActiveTab.Profile)}>
                    {ActiveTab.Profile}
                </button>
                <button className={`filter-chip ${tab === ActiveTab.Security ? "filter-chip--active" : ""}`} onClick={() => setTab(ActiveTab.Security)}>
                    {ActiveTab.Security}
                </button>
            </div>
            {tab === ActiveTab.Profile && (
                <ProfileTab />
            )}
            {tab === ActiveTab.Security && (
                <SecurityTab />
            )}
        </PageLayout>
    );
}