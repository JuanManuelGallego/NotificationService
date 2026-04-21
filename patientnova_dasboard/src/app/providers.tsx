"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/src/app/AuthContext";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NuqsAdapter>
            <ErrorBoundary>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ErrorBoundary>
        </NuqsAdapter>
    );
}
