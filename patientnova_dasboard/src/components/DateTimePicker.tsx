import { ConfigProvider, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/es';
import esEs from 'antd/locale/es_ES';

dayjs.locale('es');
import { antThemeConfig } from "@/src/styles/theme";

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
        <ConfigProvider locale={esEs} theme={antThemeConfig}>
            <DatePicker
                value={date ? dayjs(date) : null}
                onChange={handleChange}
                showTime={showTime ? {
                    format: "HH:mm",
                    minuteStep: 5,
                } : false}
                needConfirm
                format={showTime ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY"}
                placeholder={showTime ? "Selecciona fecha y hora" : "Selecciona fecha"}
                disabledDate={(current) => isFuture ? current && current.isBefore(dayjs(), "day") : current && current.isAfter(dayjs(), "day")}
                disabledTime={isFuture ? (current) => {
                    if (!current || !current.isSame(dayjs(), "day")) return {};
                    const now = dayjs();
                    return {
                        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                        disabledMinutes: (hour: number) =>
                            hour === now.hour()
                                ? Array.from({ length: now.minute() }, (_, i) => i)
                                : [],
                    };
                } : undefined}
                style={{ width: "100%" }}
            />
        </ConfigProvider>
    );
}
