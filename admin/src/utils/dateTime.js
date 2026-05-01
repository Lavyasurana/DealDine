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

const DATE_INPUT_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

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

export const formatTimeValue = (value) => {
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    return "";
  }

  const [hour, minute] = value.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hour, minute));

  return date.toLocaleTimeString("en-IN", {
    ...TIME_OPTIONS,
    timeZone: "UTC",
  });
};

export const formatDealTimeRange = (deal) => {
  if (deal?.startTime && deal?.endTime) {
    const start = formatTimeValue(deal.startTime);
    const end = formatTimeValue(deal.endTime);
    return start && end ? `${start} - ${end}` : "";
  }

  if (deal?.validFrom && deal?.validTill) {
    const start = new Date(deal.validFrom);
    const end = new Date(deal.validTill);

    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      return `${start.toLocaleTimeString("en-IN", TIME_OPTIONS)} - ${end.toLocaleTimeString("en-IN", TIME_OPTIONS)}`;
    }
  }

  return "";
};

export const getDateInputValue = (value) => {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const parts = Object.fromEntries(
    DATE_INPUT_FORMATTER.formatToParts(parsed).map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const formatDealDateList = (deal) => {
  const values = Array.isArray(deal?.availableDates) && deal.availableDates.length > 0
    ? deal.availableDates
    : deal?.validFrom
      ? [deal.validFrom]
      : [];

  const labels = values.map((value) => formatDate(value)).filter(Boolean);

  if (labels.length === 0) {
    return "";
  }

  if (labels.length === 1 || labels[0] === labels[labels.length - 1]) {
    return labels[0];
  }

  return `${labels[0]} - ${labels[labels.length - 1]}`;
};
