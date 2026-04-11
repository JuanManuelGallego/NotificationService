import AuthGuard from "@/src/components/AuthGuard";

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
