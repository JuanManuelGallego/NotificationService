import AuthGuard from "@/src/components/AuthGuard";

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
