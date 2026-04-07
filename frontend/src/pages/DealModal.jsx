import { useParams } from "react-router-dom";
import { Clock, ChevronDown } from "lucide-react";
import { useEffect, useContext, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import DiscountCard from "../components/DiscountCard";
import { toast } from "react-toastify";
import axios from "axios";


export function DealModal() {
  const { dealId } = useParams();

  const { liveDeals, backendUrl, navigate, userCredits,setUser,userLogin } =
    useContext(rescueContext);

  const [open, setOpen] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [loadingOnlinePayment, setLoadingOnlinePayment] = useState(false);

  const deal = liveDeals.find((d) => d._id === dealId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dealId]);

  if (!deal) {
    return <div className="p-6 text-center">Deal not found.</div>;
  }

  const upcomingDeals = liveDeals.filter(
    (d) => d.resName === deal.resName && d._id !== deal._id
  );

  const cashfreePaymentHandler = async (e) => {
    e.preventDefault();

    if (!window.Cashfree) {
      toast.error("Cashfree checkout is not available right now");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return navigate("/login");
    }

    try {
      setLoadingOnlinePayment(true);
      const { data } = await axios.post(
        `${backendUrl}/api/payment/cashfree/order`,
        { dealId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to start payment");
    } finally {
      setLoadingOnlinePayment(false);
    }
  };

  // ================= CREDITS =================
  const payWithCreditsHandler = async () => {
    try {
      setLoadingCredits(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first");
        return navigate("/login");
      }

      const { data } = await axios.post(
        `${backendUrl}/api/payment/pay-with-credits`,
        { dealId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setUser((prev) => ({
          ...prev,
          credits: data.remainingCredits,
        }));
        navigate(`/coupon/${data.coupon._id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoadingCredits(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={deal.image}
            alt={deal.resName}
            className="w-full h-64 object-cover"
          />

          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">{deal.resName}</h1>

            <p className="text-green-600 font-semibold text-lg">
              {deal.dealName}
            </p>

            <p>
              Valid On -{" "}
              {new Date(deal.validFrom).toLocaleDateString("en-IN")}
            </p>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <p>
                {new Date(deal.validFrom).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(deal.validTill).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-500">{deal.location}</p>

            {/* 💰 PRICE + PAYMENT */}
            <div className="pt-4 border-t space-y-3">
              <span className="text-3xl font-bold">₹{deal.price}</span>

              {/* Cashfree */}
              <button
                onClick={cashfreePaymentHandler}
                disabled={loadingOnlinePayment}
                className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition disabled:bg-gray-500"
              >
                {loadingOnlinePayment ? "Opening Checkout..." : "Pay Online"}
              </button>

              {/* Credits */}
            
              <button
                onClick={payWithCreditsHandler}
                disabled={userCredits < deal.price || loadingCredits || !userLogin}
                className={`w-full py-3 rounded-xl transition ${
                  userCredits >= deal.price
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loadingCredits
                  ? "Processing..."
                  : `Use Credits (₹${userCredits})`}
              </button>

              {userCredits < deal.price && (
                <p className="text-sm text-red-500 text-center">
                  {userLogin?"Not enough credits":"Create an account and get 50 credits"}
                </p>
              )}
            </div>

            {/* TERMS */}
            <div className="border-t pt-4">
              <div
                className="flex justify-between cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <p className="font-semibold">Terms & Conditions</p>
                <ChevronDown
                  className={`transition ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>

              {open && (
                <ul className="mt-3 text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Valid only on selected menu items.</li>
                  <li>Cannot be combined with other offers.</li>
                  <li>Dine-in only.</li>
                  <li>Restaurant may cancel anytime.</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        {upcomingDeals.length > 0 && (
          <div className="lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4">
              More from this restaurant
            </h2>

            <div className="space-y-4">
              {upcomingDeals.map((d) => (
                <DiscountCard
                  key={d._id}
                  name={d.resName}
                  offer={d.dealName}
                  validFrom={d.validFrom}
                  validTill={d.validTill}
                  image={d.image}
                  price={d.price}
                  dealId={d._id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
