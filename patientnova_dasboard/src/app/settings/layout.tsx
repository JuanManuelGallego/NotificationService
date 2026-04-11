import AuthGuard from "@/src/components/AuthGuard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
