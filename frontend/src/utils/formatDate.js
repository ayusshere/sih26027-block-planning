/**
 * Railway Standard Date and Time Formatters
 */

export function formatTime24(dateString) {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDateShort(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return `${formatDateShort(d)} ${formatTime24(d)}`;
}

export function formatDurationMinutes(startString, endString) {
  if (!startString || !endString) return 0;
  const s = new Date(startString).getTime();
  const e = new Date(endString).getTime();
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  const mins = Math.round((e - s) / 60000);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0 && remMins > 0) return `${hrs}h ${remMins}m`;
  if (hrs > 0) return `${hrs} hrs`;
  return `${mins} mins`;
}

export function toLocalDatetimeInput(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}
