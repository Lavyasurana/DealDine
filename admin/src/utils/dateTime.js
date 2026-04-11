const DATE_TIME_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
};

const DATE_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
};

export const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("en-IN", DATE_OPTIONS);
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleString("en-IN", DATE_TIME_OPTIONS);
};
