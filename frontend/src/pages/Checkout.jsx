import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Clock } from "lucide-react";
import { rescueContext } from "../context/rescueContext";
import { formatDate, formatTime } from "../utils/dateTime";

const CASHFREE_APPROVED_ORIGIN = "https://www.dealdine.in";

export function Checkout() {
  const { dealId } = useParams();
  const { backendUrl, navigate, getUser, userLogin, authReady } = useContext(rescueContext);
  const [deal, setDeal] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const handledLoadFailureRef = useRef(false);

  useEffect(() => {
    const loadCheckout = async () => {
      if (!authReady) {
        return;
      }

      if (!userLogin) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/payment/checkout-summary/${dealId}`,
          { withCredentials: true }
        );

        if (!data.success) {
          if (!handledLoadFailureRef.current) {
            handledLoadFailureRef.current = true;
            toast.error(data.message || "Failed to load checkout");
          }
          navigate(`/getDeals/${dealId}`, { replace: true });
          return;
        }

        setDeal(data.deal);
        setSummary(data.summary);
      } catch (error) {
        const existingCouponId = error.response?.data?.existingCouponId;

        if (existingCouponId) {
          if (!handledLoadFailureRef.current) {
            handledLoadFailureRef.current = true;
            toast.info("You already own this coupon");
          }
          navigate(`/coupon/${existingCouponId}`, { replace: true });
          return;
        }

        if (!handledLoadFailureRef.current) {
          handledLoadFailureRef.current = true;
          toast.error(error.response?.data?.message || "Failed to load checkout");
        }
        navigate(`/getDeals/${dealId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadCheckout();
  }, [authReady, backendUrl, dealId, navigate, userLogin]);

  const payHandler = async () => {
    if (!userLogin) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    try {
      setPaying(true);

      if (summary.cashAmount === 0) {
        const { data } = await axios.post(
          `${backendUrl}/api/payment/pay-with-credits`,
          { dealId },
          { withCredentials: true }
        );

        if (!data.success) {
          toast.error(data.message || "Failed to complete purchase");
          return;
        }

        await getUser();
        toast.success("Coupon unlocked successfully");
        navigate(`/coupon/${data.coupon._id}`);
        return;
      }

      if (window.location.origin !== CASHFREE_APPROVED_ORIGIN) {
        window.location.href = `${CASHFREE_APPROVED_ORIGIN}/checkout/${dealId}`;
        return;
      }

      if (!window.Cashfree) {
        toast.error("Cashfree checkout is not available right now");
        return;
      }

      const { data } = await axios.post(
        `${backendUrl}/api/payment/cashfree/order`,
        { dealId },
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error(data.message || "Failed to start payment");
        return;
      }

      const cashfree = window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_ENV || "production",
      });

      const result = await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to continue checkout");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center">Loading checkout...</div>;
  }

  if (!deal || !summary) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center">Checkout unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="border-b">
          <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
            <img
              src={deal.image}
              alt={deal.resName}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Coupon Checkout
            </p>
            <h1 className="text-3xl font-bold text-gray-900">{deal.resName}</h1>
            <p className="text-xl font-semibold text-green-600">{deal.dealName}</p>
            <p className="text-gray-600">{deal.location}</p>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <p>Valid from: {formatDate(deal.validFrom)} | {formatTime(deal.validFrom)}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <p>Valid till: {formatDate(deal.validTill)} | {formatTime(deal.validTill)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-2xl bg-gray-50 p-5 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Coupon price</span>
              <span className="font-semibold">₹{summary.dealPrice}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Your credits</span>
              <span className="font-semibold">₹{summary.availableCredits}</span>
            </div>
            <div className="flex items-center justify-between text-lg text-green-600">
              <span>Credits used</span>
              <span className="font-semibold">-₹{summary.creditsApplied}</span>
            </div>
            <div className="flex items-center justify-between text-lg">
              <span className="text-gray-600">Credits left</span>
              <span className="font-semibold">₹{summary.creditsLeft}</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between text-2xl font-bold">
              <span>Amount payable</span>
              <span>₹{summary.cashAmount}</span>
            </div>
          </div>

          <button
            onClick={payHandler}
            disabled={paying}
            className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-500"
          >
            {paying
              ? "Processing..."
              : summary.cashAmount === 0
                ? "Complete Purchase"
                : `Pay ₹${summary.cashAmount} with Cashfree`}
          </button>

          <button
            onClick={() => navigate(`/getDeals/${dealId}`)}
            className="w-full border border-gray-300 text-gray-700 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition"
          >
            Back to Deal
          </button>
        </div>
      </div>
    </div>
  );
}
