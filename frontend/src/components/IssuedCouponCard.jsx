import { useContext } from "react";
import { rescueContext } from "../context/rescueContext";
import { formatDateTime, parseBackendDateTime } from "../utils/dateTime";

export function IssuedCouponCard({ coupon }) {
  const { navigate } = useContext(rescueContext);
  const deal = coupon?.deal;

  const handleClick = () => {
    if (!deal) return;
    navigate(`/coupon/${coupon._id}`);
  };

  // ✅ STATUS LOGIC
  const now = new Date();
  const validTill = deal?.validTill
    ? parseBackendDateTime(deal.validTill)
    : null;

  let status = "Active";
  let statusColor = "text-green-600";

  if (coupon.isUsed) {
    status = "Used";
    statusColor = "text-red-600";
  } else if (validTill && now > validTill) {
    status = "Expired";
    statusColor = "text-gray-500";
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white p-6 rounded-xl shadow-md border transition ${
        deal ? "cursor-pointer hover:shadow-lg" : "opacity-70"
      }`}
    >
      <h3 className="text-lg font-semibold">
        {deal?.dealName || "Deal unavailable"}
      </h3>

      <p className="text-gray-600">
        Restaurant: {deal?.resName || "N/A"}
      </p>

      <p className="text-gray-500 text-sm">
        Issued: {formatDateTime(coupon.issuedAt)}
      </p>

      {/* ✅ VALIDITY */}
      {deal?.validFrom && deal?.validTill ? (
        <p className="text-gray-500 text-sm mt-1">
          Valid: {formatDateTime(deal.validFrom)} {" - "} {formatDateTime(deal.validTill)}
        </p>
      ) : deal?.validTill ? (
        <p className="text-gray-500 text-sm mt-1">
          Valid till: {formatDateTime(deal.validTill)}
        </p>
      ) : null}

      {/* ✅ STATUS */}
      <p className={`mt-3 font-semibold ${statusColor}`}>
        {deal ? status : "Unavailable"}
      </p>
    </div>
  );
}
