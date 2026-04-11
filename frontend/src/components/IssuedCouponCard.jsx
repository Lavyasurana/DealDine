import { useContext } from "react";
import { rescueContext } from "../context/rescueContext";
import { formatDateTime, parseBackendDateTime } from "../utils/dateTime";

export function IssuedCouponCard({ coupon }) {
  const { navigate } = useContext(rescueContext);

  const handleClick = () => {
    navigate(`/coupon/${coupon._id}`);
  };

  // ✅ STATUS LOGIC
  const now = new Date();
  const validTill = coupon.deal.validTill
    ? parseBackendDateTime(coupon.deal.validTill)
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
      className="bg-white p-6 rounded-xl shadow-md border cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-lg font-semibold">
        {coupon.deal.dealName}
      </h3>

      <p className="text-gray-600">
        Restaurant: {coupon.deal.resName}
      </p>

      <p className="text-gray-500 text-sm">
        Issued: {formatDateTime(coupon.issuedAt)}
      </p>

      {/* ✅ VALIDITY */}
      {coupon.deal.validTill && (
        <p className="text-gray-500 text-sm mt-1">
          Valid till:{" "}
          {formatDateTime(coupon.deal.validTill)}
        </p>
      )}

      {/* ✅ STATUS */}
      <p className={`mt-3 font-semibold ${statusColor}`}>
        {status}
      </p>
    </div>
  );
}
