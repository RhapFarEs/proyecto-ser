export function getFormattedDate() {
  const today = new Date();

  return today.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}