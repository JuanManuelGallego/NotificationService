import { ConfigProvider, DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/es';
import esEs from 'antd/locale/es_ES';

dayjs.locale('es');
import { useFetchAppointments } from "../api/useFetchAppointments";
import { antThemeConfig } from "@/src/styles/theme";

export function AppointmentDateTimePicker({
    date,
    onChanged,
}: {
    date: string | undefined;
    onChanged: (date: string) => void;
}) {
    const { appointments } = useFetchAppointments();

    const handleChange = (selectedDate: Dayjs | null) => {
        if (!selectedDate) return;

        const selectedIso = selectedDate.toISOString();

        const isBooked = appointments.some((a) => {
            return new Date(a.startAt).getTime() === selectedDate.valueOf();
        });

        if (isBooked) {
            alert("This time slot is already booked");
            return;
        }

        onChanged(selectedIso);
    };

    return (
        <ConfigProvider locale={esEs} theme={antThemeConfig}>
            <DatePicker
                value={date ? dayjs(date) : null}
                onChange={handleChange}
                showTime={{
                    format: "HH:mm",
                    minuteStep: 5,
                }}
                needConfirm
                showNow={false}
                format="DD/MM/YYYY HH:mm"
                placeholder="Selecciona fecha y hora"
                disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
                disabledTime={() => ({
                    disabledHours: () => {
                        const hours = [];
                        for (let i = 0; i < 6; i++) hours.push(i);
                        for (let i = 21; i < 24; i++) hours.push(i);
                        return hours;
                    },
                    disabledMinutes: (hour) => {
                        if (hour === 6 || hour === 20) {
                            const minutes = [];
                            for (let i = 0; i < 60; i += 5) {
                                if (i > 0) minutes.push(i);
                            }
                            return minutes;
                        }
                        return [];
                    },
                })}
                style={{ width: "100%" }}
            />
        </ConfigProvider>
    );
}
