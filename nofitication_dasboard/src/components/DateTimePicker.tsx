import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";

export function DateTimePicker({
    date,
    onChanged,
    showTime = false,
    isFuture = false,
}: {
    date: string | undefined;
    onChanged: (date: string) => void;
    showTime?: boolean;
    isFuture?: boolean;
}) {
    const handleChange = (selectedDate: Dayjs | null) => {
        if (!selectedDate) return;
        const selectedIso = selectedDate.toISOString();
        onChanged(selectedIso);
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            <DatePicker
                value={date ? dayjs(date) : null}
                onChange={handleChange}
                showTime={showTime ? {
                    format: "HH:mm",
                    minuteStep: 5,
                } : false}
                needConfirm={false}
                format={showTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY"}
                placeholder={showTime ? "Selecciona fecha y hora" : "Selecciona fecha"}
                disabledDate={(current) => isFuture ? current && current.isBefore(dayjs(), "day") : current && current.isAfter(dayjs(), "day")}
                style={{ width: "100%" }}
            />
        </div>
    );
}
