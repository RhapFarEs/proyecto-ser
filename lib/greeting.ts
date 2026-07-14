export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Buenos días";
  }

  if (hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

export function formatGreeting(base: string, displayName?: string | null): string {
  const trimmed = displayName?.trim();
  return trimmed ? `${base}, ${trimmed}` : base;
}