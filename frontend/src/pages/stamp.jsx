import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";
import { formatDateTime, parseBackendDateTime } from "../utils/dateTime";

export function CouponPage() {
  const { couponId } = useParams();
  const { backendUrl } = useContext(rescueContext);

  const [coupon, setCoupon] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  // ✅ FETCH COUPON
  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          `${backendUrl}/coupon/${couponId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data.success) {
          setCoupon(data.coupon);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCoupon();
  }, [couponId, backendUrl]);

  // 🔥 SMART COUNTDOWN
  useEffect(() => {
    if (!coupon) return;

    const expiry =
      coupon.deal.validTill || coupon.deal.expiryDate;

    if (!expiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const exp = parseBackendDateTime(expiry);

      if (!exp) {
        setTimeLeft("");
        clearInterval(interval);
        return;
      }

      const diff = exp - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );

      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // 🔥 SMART DISPLAY
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }

    }, 1000);

    return () => clearInterval(interval);
  }, [coupon]);

  if (!coupon) {
    return <div className="p-10 text-center">Loading coupon...</div>;
  }

  // ✅ STATUS LOGIC
  const now = new Date();
  const validTill = coupon.deal.validTill
    ? parseBackendDateTime(coupon.deal.validTill)
    : null;

  const expiry =
    coupon.deal.validTill || coupon.deal.expiryDate;

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border-2 border-dashed border-emerald-500">

        <h1 className="text-2xl font-bold text-center text-emerald-600 mb-6">
          🎉 Coupon Issued Successfully
        </h1>

        <div className="space-y-3 text-center">

          <p className="text-lg font-semibold">
            {coupon.deal.dealName}
          </p>

          <p className="text-gray-600">
            Restaurant: {coupon.deal.resName}
          </p>

          <p className="text-gray-600">
            Issued To: {coupon.user.firstName} {coupon.user.lastName}
          </p>

          <p className="text-gray-600">
            Issued On: {formatDateTime(coupon.issuedAt)}
          </p>

          {/* ✅ VALIDITY */}
          <div className="mt-4 bg-gray-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Validity</p>

            {coupon.deal.validFrom && coupon.deal.validTill ? (
              <p className="text-md font-semibold text-gray-700">
                {formatDateTime(coupon.deal.validFrom)}
                {" → "} 
                {formatDateTime(coupon.deal.validTill)}
              </p>
            ) : expiry ? (
              <p className="text-md font-semibold text-gray-700">
                Expires on {formatDateTime(expiry)}
              </p>
            ) : (
              <p className="text-md text-gray-500">No expiry info</p>
            )}

            {/* 🔥 COUNTDOWN */}
            {expiry && (
              <p className="mt-2 text-lg font-bold text-red-500">
                ⏳ {timeLeft}
              </p>
            )}
          </div>

          {/* Coupon ID */}
          <div className="mt-6 bg-emerald-100 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Coupon ID</p>
            <p className="text-lg font-bold tracking-widest text-emerald-700">
              {coupon._id}
            </p>
          </div>

          {/* ✅ STATUS */}
          <div className={`mt-4 font-semibold ${statusColor}`}>
            {status}
          </div>

        </div>
      </div>
    </div>
  );
}
