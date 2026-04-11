const DATE_TIME_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
};

const DATE_OPTIONS = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

export const parseBackendDateTime = (value) => {
  if (!value) return null;

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
    parsed.getUTCHours(),
    parsed.getUTCMinutes(),
    parsed.getUTCSeconds(),
    parsed.getUTCMilliseconds()
  );
};

export const formatDate = (value) => {
  if (!value) return "";
  const parsed = parseBackendDateTime(value);
  return parsed ? parsed.toLocaleDateString("en-IN", DATE_OPTIONS) : "";
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const parsed = parseBackendDateTime(value);
  return parsed ? parsed.toLocaleString("en-IN", DATE_TIME_OPTIONS) : "";
};
