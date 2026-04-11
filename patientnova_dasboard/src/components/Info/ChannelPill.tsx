import { Channel, CHANNEL_CFG } from "@/src/types/Reminder";

export function ChannelPill({ type, value }: { type: Channel; value: string | null | undefined }) {
    if (!value) {
        return (
            <span style={{ fontSize: 11, color: "var(--c-gray-400)", display: "flex", alignItems: "center", gap: 3 }}>
                <span className="td-email-empty__dash">—</span>
            </span>
        );
    }
    return (
        <span title={value} className="pill" style={{
            background: "var(--c-gray-100)", fontWeight: 500, color: "var(--c-gray-700)",
            padding: "2px 10px",
        }}>
            {CHANNEL_CFG[ type ].icon} {value}
        </span>
    );
}
