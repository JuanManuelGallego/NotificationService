import AuthGuard from "@/src/components/AuthGuard";

export default function RemindersLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
