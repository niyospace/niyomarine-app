export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

export function isExpiringSoon(date) {
  const today = new Date();
  const expiry = new Date(date);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}