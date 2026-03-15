export function PayBadge({ payed }: { payed: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: payed ? "#F0FDF4" : "#FEF9C3",
            color: payed ? "#16A34A" : "#92400E",
        }}>
            {payed ? "💳 Pagado" : "⏳ Pendiente"}
        </span>
    );
}