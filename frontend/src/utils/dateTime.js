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

const TIME_VALUE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  ...TIME_OPTIONS,
  timeZone: "UTC",
});

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

export const formatTimeValue = (value) => {
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    return "";
  }

  const [hour, minute] = value.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hour, minute));

  return TIME_VALUE_FORMATTER.format(date);
};

export const formatDealTimeRange = (deal) => {
  if (deal?.startTime && deal?.endTime) {
    const start = formatTimeValue(deal.startTime);
    const end = formatTimeValue(deal.endTime);
    return start && end ? `${start} - ${end}` : "";
  }

  if (deal?.validFrom && deal?.validTill) {
    return `${formatTime(deal.validFrom)} - ${formatTime(deal.validTill)}`;
  }

  return "";
};

export const getDateInputValue = (value) => {
  const parsed = parseBackendDateTime(value);
  if (!parsed) return "";

  const parts = Object.fromEntries(
    DATE_INPUT_FORMATTER.formatToParts(parsed).map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const getDealAvailableDateValues = (deal) => {
  if (!Array.isArray(deal?.availableDates) || deal.availableDates.length === 0) {
    if (deal?.validFrom) {
      return [getDateInputValue(deal.validFrom)].filter(Boolean);
    }

    return [];
  }

  return deal.availableDates.map((value) => getDateInputValue(value)).filter(Boolean);
};

const combineDateAndTime = (dateValue, timeValue, fallbackValue = null) => {
  const date = typeof dateValue === "string" ? dateValue : getDateInputValue(dateValue);

  if (!date) {
    return fallbackValue ? parseBackendDateTime(fallbackValue) : null;
  }

  if (!timeValue || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeValue)) {
    return fallbackValue ? parseBackendDateTime(fallbackValue) : null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = timeValue.split(":").map(Number);

  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30));
};

export const getDealScheduleEntries = (deal) => {
  const dateValues = getDealAvailableDateValues(deal);

  if (dateValues.length > 0 && deal?.startTime && deal?.endTime) {
    return dateValues
      .map((dateValue) => {
        const start = combineDateAndTime(dateValue, deal.startTime);
        const end = combineDateAndTime(dateValue, deal.endTime);

        if (!start || !end) {
          return null;
        }

        return { dateValue, start, end };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
  }

  const fallbackStart = parseBackendDateTime(deal?.validFrom);
  const fallbackEnd = parseBackendDateTime(deal?.validTill);

  if (!fallbackStart || !fallbackEnd) {
    return [];
  }

  return [
    {
      dateValue: getDateInputValue(fallbackStart),
      start: fallbackStart,
      end: fallbackEnd,
    },
  ];
};

export const getNextDealOccurrence = (deal, now = new Date()) => {
  const entries = getDealScheduleEntries(deal);

  return (
    entries.find((entry) => entry.end >= now) || null
  );
};

export const isDealLiveNow = (deal, now = new Date()) => {
  const occurrence = getNextDealOccurrence(deal, now);

  if (!occurrence) {
    return false;
  }

  return occurrence.start <= now && occurrence.end >= now;
};

export const getDealLastEnd = (deal) => {
  const entries = getDealScheduleEntries(deal);
  return entries.length > 0 ? entries[entries.length - 1].end : null;
};

export const formatDealDateList = (deal) => {
  const values = getDealAvailableDateValues(deal);

  if (values.length === 0) {
    return deal?.validFrom ? formatDate(deal.validFrom) : "";
  }

  const startLabel = formatDate(values[0]);
  const endLabel = formatDate(values[values.length - 1]);

  if (!startLabel) {
    return "";
  }

  if (values.length === 1 || startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
};
