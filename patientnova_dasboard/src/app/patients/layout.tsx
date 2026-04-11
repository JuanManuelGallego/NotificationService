import AuthGuard from "@/src/components/AuthGuard";

export default function PatientsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
