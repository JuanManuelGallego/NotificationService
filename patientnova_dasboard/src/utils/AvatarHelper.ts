import { Patient } from "../types/Patient";
import { User } from "../types/User";

function getInitials(name: string, lastName: string) {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getPatientFullName(patient: Patient | undefined) {
    if (!patient) return "";
    return `${patient.name} ${patient.lastName}`;
}

function getUserName(user: User | undefined | null) {
    if (!user) return "";
    return user.displayName ?? `${user.firstName} ${user.lastName}`;
}

function getAvatarColor(id: string) {
    const hues = [ 200, 160, 280, 30, 340, 60, 240 ];
    const idx = id.charCodeAt(0) % hues.length;
    return `hsl(${hues[ idx ]}, 55%, 82%)`;
}

/** Resize an image File to a JPEG base64 data-URL at most maxSide×maxSide px. */
async function resizeToBase64(file: File, maxSide = 256): Promise<string> {
    if (typeof window === 'undefined') throw new Error("resizeToBase64 requires a browser environment");
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (ev) => {
            const img = new window.Image();
            img.onerror = reject;
            img.onload = () => {
                const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };
            img.src = ev.target!.result as string;
        };
        reader.readAsDataURL(file);
    });
}

export { getInitials, getAvatarColor, resizeToBase64, getPatientFullName, getUserName };