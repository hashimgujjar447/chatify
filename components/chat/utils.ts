export function getFormattedTime(date: string): string {
  const d = new Date(date);
  const getTime = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return getTime;
}

export function canDeleteForEveryone(date: string): boolean {
  const d = new Date(date);
  const t = d.getTime();
  const now = new Date();
  // Check if message is within 2 minutes
  if (now.getTime() - t > 2 * 60 * 1000) return false;
  return true;
}

export function getRoomId(senderId: string, receiverId: string): string {
  return [senderId, receiverId].sort().join("-");
}
