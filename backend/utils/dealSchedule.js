const IST_OFFSET_HOURS = 5;
const IST_OFFSET_MINUTES = 30;

const pad = (value) => String(value).padStart(2, "0");

export const isValidTimeString = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

export const parseDateOnlyAsIST = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if ([year, month, day].some(Number.isNaN)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, -IST_OFFSET_HOURS, -IST_OFFSET_MINUTES));
};

export const formatDateAsISO = (value) => {
  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(parsed);
};

export const normalizeAvailableDates = (dates = []) => {
  const normalized = dates
    .map((value) => {
      if (value instanceof Date) {
        return parseDateOnlyAsIST(formatDateAsISO(value));
      }

      return parseDateOnlyAsIST(String(value).trim());
    })
    .filter(Boolean);

  const uniqueByIsoDate = new Map();

  normalized.forEach((date) => {
    uniqueByIsoDate.set(formatDateAsISO(date), date);
  });

  return Array.from(uniqueByIsoDate.values()).sort((a, b) => a.getTime() - b.getTime());
};

export const combineDateAndTimeAsIST = (dateValue, timeValue) => {
  const date =
    dateValue instanceof Date
      ? parseDateOnlyAsIST(formatDateAsISO(dateValue))
      : parseDateOnlyAsIST(String(dateValue || "").trim());

  if (!date || !isValidTimeString(timeValue)) {
    return null;
  }

  const [hour, minute] = timeValue.split(":").map(Number);
  const isoDate = formatDateAsISO(date);
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(
    Date.UTC(year, month - 1, day, hour - IST_OFFSET_HOURS, minute - IST_OFFSET_MINUTES)
  );
};

export const compareTimeStrings = (startTime, endTime) => {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return NaN;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  return startHour * 60 + startMinute - (endHour * 60 + endMinute);
};

export const buildDealAvailabilityWindow = ({ availableDates, startTime, endTime }) => {
  const normalizedDates = normalizeAvailableDates(availableDates);

  if (!normalizedDates.length || !isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return {
      availableDates: normalizedDates,
      validFrom: null,
      validTill: null,
      expiryDate: null,
    };
  }

  const firstDate = normalizedDates[0];
  const lastDate = normalizedDates[normalizedDates.length - 1];

  const validFrom = combineDateAndTimeAsIST(firstDate, startTime);
  const validTill = combineDateAndTimeAsIST(lastDate, endTime);

  return {
    availableDates: normalizedDates,
    validFrom,
    validTill,
    expiryDate: validTill,
  };
};

export const getDealScheduleEntries = (deal) => {
  const dates = normalizeAvailableDates(deal?.availableDates || []);

  if (dates.length > 0 && isValidTimeString(deal?.startTime) && isValidTimeString(deal?.endTime)) {
    return dates
      .map((date) => {
        const start = combineDateAndTimeAsIST(date, deal.startTime);
        const end = combineDateAndTimeAsIST(date, deal.endTime);

        if (!start || !end) {
          return null;
        }

        return { start, end };
      })
      .filter(Boolean);
  }

  if (deal?.validFrom && deal?.validTill) {
    return [
      {
        start: new Date(deal.validFrom),
        end: new Date(deal.validTill),
      },
    ];
  }

  return [];
};

export const isDealLiveAt = (deal, now = new Date()) =>
  getDealScheduleEntries(deal).some((entry) => entry.start <= now && entry.end >= now);

export const formatTimeRangeLabel = (startTime, endTime) => {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return "";
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = new Date(Date.UTC(2000, 0, 1, startHour, startMinute));
  const end = new Date(Date.UTC(2000, 0, 1, endHour, endMinute));

  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const toTimeInputValue = (date) => {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(parsed);
};

export const toDateInputValue = (date) => formatDateAsISO(date);

export const toDateTimeLocalValue = (date) => {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(parsed).map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};
