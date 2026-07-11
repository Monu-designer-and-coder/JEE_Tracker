// * ==========================================================================
// * Helper Methods
// * ==========================================================================

// * Formats date cleanly using Intl API to avoid manual month indexing bugs
export const formatDate = (dateText: string) => {
  if (!dateText) return '';
  const date = new Date(dateText);
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};


export function formatMilliseconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(hours)}.${pad(minutes)}.${pad(seconds)}`;
}
