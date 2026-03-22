import { Appointment, LOCATION_CFG, AppointmentStatus } from "@/src/types/Appointment";
import { today, MONTH_NAMES_ES, DAY_NAMES_ES, formatTime, getDate } from "@/src/utils/TimeUtils";
import { useState, useMemo } from "react";

export function CalendarView({ appointments, onDayClick, onApptClick }: {
    appointments: Appointment[];
    onDayClick: (date: string) => void;
    onApptClick: (a: Appointment) => void;
}) {
    const [ calYear, setCalYear ] = useState(new Date().getFullYear());
    const [ calMonth, setCalMonth ] = useState(new Date().getMonth());

    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells = startOffset + daysInMonth;
    const rows = Math.ceil(cells / 7);

    const apptByDate = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        for (const a of appointments) {
            const date = getDate(a.startAt)
            if (!map[ date ]) map[ date ] = [];
            map[ date ].push(a);
        }
        return map;
    }, [ appointments ]);

    function cellDate(cell: number): string | null {
        const day = cell - startOffset + 1;
        if (day < 1 || day > daysInMonth) return null;

        return `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    const todayStr = today();
    console.log("Appointments by date:", apptByDate);

    return (
        <div className="table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--c-gray-100)" }}>
                <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                    className="btn-secondary" style={{ padding: "7px 14px", fontSize: 16 }}>&#8249;</button>
                <span style={{ fontSize: 18, fontWeight: 700, color: "var(--c-gray-900)" }}>
                    {MONTH_NAMES_ES[ calMonth ]} {calYear}
                </span>
                <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                    className="btn-secondary" style={{ padding: "7px 14px", fontSize: 16 }}>&#8250;</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--c-gray-50)" }}>
                {DAY_NAMES_ES.map(d => (
                    <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--c-gray-400)", letterSpacing: "0.05em" }}>{d}</div>
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {Array.from({ length: rows * 7 }).map((_, i) => {
                    const date = cellDate(i);
                    const isToday = date === todayStr;
                    const appts = date ? (apptByDate[ getDate(date) ] ?? []) : [];
                    console.log(date, appts);
                    return (
                        <div key={i} onClick={() => date && onDayClick(date)} style={{
                            minHeight: 150, padding: "8px 10px",
                            borderRight: (i + 1) % 7 !== 0 ? "1px solid var(--c-gray-100)" : "none",
                            borderBottom: i < rows * 7 - 7 ? "1px solid var(--c-gray-100)" : "none",
                            background: !date ? "var(--c-input-bg)" : isToday ? "var(--c-today-bg)" : "var(--c-white)",
                            cursor: date ? "pointer" : "default",
                            transition: "background 0.1s",
                        }}
                            onMouseEnter={e => { if (date) (e.currentTarget as HTMLElement).style.background = isToday ? "var(--c-today-hover-bg)" : "var(--c-gray-50)"; }}
                            onMouseLeave={e => { if (date) (e.currentTarget as HTMLElement).style.background = isToday ? "var(--c-today-bg)" : "var(--c-white)"; }}
                        >
                            {date && (
                                <>
                                    <div style={{
                                        fontSize: 13, fontWeight: isToday ? 700 : 500,
                                        color: isToday ? "var(--c-white)" : "var(--c-gray-700)",
                                        background: isToday ? "var(--c-brand)" : "transparent",
                                        width: 24, height: 24, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        marginBottom: 4,
                                    }}>
                                        {parseInt(date.slice(8))}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        {appts.slice(0, 3).map(a => (
                                            <div key={a.id} onClick={e => { e.stopPropagation(); onApptClick(a); }}
                                                className="text-ellipsis"
                                                style={{
                                                    fontSize: 10, fontWeight: 600, padding: "2px 5px", borderRadius: 4,
                                                    background: LOCATION_CFG[ a.location ]?.bg ?? "var(--c-gray-200)",
                                                    color: LOCATION_CFG[ a.location ]?.color ?? "var(--c-gray-700)",
                                                    cursor: "pointer",
                                                }}>
                                                {formatTime(a.startAt)} {a.patient.name} {a.patient.lastName} - {a.location} {a.status == AppointmentStatus.CONFIRMED && "✅"}
                                            </div>
                                        ))}
                                        {appts.length > 3 && (
                                            <div style={{ fontSize: 10, color: "var(--c-gray-400)", paddingLeft: 4 }}>+{appts.length - 3} más</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
