"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Sidebar from "@/src/components/Sidebar";
import { useMediaQuery } from "@/src/hooks/useMediaQuery";

/** Wraps the standard page-shell (sidebar + navbar + main content area). */
export default function PageLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    // responsive: auto-close mobile sidebar when crossing to desktop
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (isDesktop) setSidebarOpen(false);
    }, [isDesktop]);

    // responsive: lock body scroll when mobile sidebar is open (iOS-safe)
    useEffect(() => {
        if (sidebarOpen && !isDesktop) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.left = "";
                document.body.style.right = "";
                document.body.style.overflow = "";
                window.scrollTo(0, scrollY);
            };
        }
    }, [sidebarOpen, isDesktop]);

    // responsive: close sidebar on Escape key
    useEffect(() => {
        if (!sidebarOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [sidebarOpen]);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);

    return (
        <div className="page-shell">
            {/* responsive: mobile sidebar backdrop */}
            {sidebarOpen && !isDesktop && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            <div className="page-content-wrapper">
                {/* responsive: top navbar — hamburger visible below lg, hidden on lg+ */}
                <header className="top-navbar">
                    <button
                        className="navbar-hamburger"
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label="Abrir menú"
                        aria-expanded={sidebarOpen}
                    >
                        ☰
                    </button>
                    <div className="navbar-brand">
                        <Image
                            src="/favicon.ico"
                            alt="Patient Nova"
                            width={28}
                            height={28}
                            sizes="28px"
                            style={{ borderRadius: "var(--r-md)" }}
                        />
                        <span className="navbar-brand__text">Patient Nova</span>
                    </div>
                    <div className="navbar-spacer" />
                </header>

                <main className="page-main">{children}</main>
            </div>
        </div>
    );
}
