"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/src/app/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NuqsAdapter>
            <AuthProvider>
                {children}
            </AuthProvider>
        </NuqsAdapter>
    );
}
