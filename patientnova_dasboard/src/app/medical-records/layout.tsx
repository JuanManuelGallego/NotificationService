import AuthGuard from "@/src/components/AuthGuard";

export default function MedicalRecordsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
