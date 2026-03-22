"use client";

import Sidebar from "../components/Navigation/Sidebar";

export default function NotificationsPage() {
  return (
    <>
      <div className="page-shell">
        <Sidebar />
        <main className="page-main">
          <h1 className="page-title">
            Página Principal
          </h1>
          <p className="page-subtitle">
            Página Principal - Próximamente
          </p>
        </main>
      </div>
    </>);
}
