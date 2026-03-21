export const RequiredField = ({ label }: { label: string }) => (
    <span>
        {label}
        <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>
    </span>
);