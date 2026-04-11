const DATE_TIME_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
};

const DATE_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
};

const TIME_OPTIONS = {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
};

export const parseBackendDateTime = (value) => {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const parsed = parseBackendDateTime(value);
  return parsed ? parsed.toLocaleString("en-IN", DATE_TIME_OPTIONS) : "";
};

export const formatDate = (value) => {
  if (!value) return "";
  const parsed = parseBackendDateTime(value);
  return parsed ? parsed.toLocaleDateString("en-IN", DATE_OPTIONS) : "";
};

export const formatTime = (value) => {
  if (!value) return "";
  const parsed = parseBackendDateTime(value);
  return parsed ? parsed.toLocaleTimeString("en-IN", TIME_OPTIONS) : "";
};
