function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString("es-ES", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function fmtDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("es-ES", {
        weekday: "short", day: "numeric", month: "short",
    });
}

function fmtRelative(iso: string) {
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    if (abs < 60_000) return "Ahora mismo";
    if (abs < 3_600_000) return `${Math.round(abs / 60_000)} min`;
    if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)} h`;
    return `${Math.round(abs / 86_400_000)} días`;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_NAMES_ES = [ "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom" ];

export { fmtDateTime, fmtDate, fmtRelative, today, MONTH_NAMES_ES, DAY_NAMES_ES };
