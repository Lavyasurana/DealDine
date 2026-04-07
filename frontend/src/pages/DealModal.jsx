import { useParams } from "react-router-dom";
import { Clock, ChevronDown } from "lucide-react";
import { useEffect, useContext, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import DiscountCard from "../components/DiscountCard";
import { toast } from "react-toastify";
import axios from "axios";
import QRCode from "qrcode";


export function DealModal() {
  const { dealId } = useParams();

  const { liveDeals, backendUrl, navigate, userCredits,setUser,userLogin } =
    useContext(rescueContext);

  const [open, setOpen] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showUpiApps, setShowUpiApps] = useState(false);

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

  const amount = deal.price * 100;
  const currency = "INR";
  const receiptId = "receipt_" + Date.now();

  const upiId = "choudharimahi8@okicici";
  const payeeName = "DealDine";
  const transactionNote = `Deal for ${deal.resName}`;
  const buildUpiUrl = (scheme = "upi://pay") => {
    const transactionRef = `dealdine_${dealId}_${Date.now()}`;
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName,
      mc: "0000",
      tr: transactionRef,
      tn: transactionNote,
      am: Number(deal.price).toFixed(2),
      cu: "INR",
    });

    return `${scheme}?${params.toString()}`;
  };

  const openUpiUrl = (scheme = "upi://pay") => {
    const upiUrl = buildUpiUrl(scheme);
    window.location.href = upiUrl;
    toast.info("Opening UPI app...");

    setTimeout(() => {
      navigate(`/verify-payment/${dealId}`);
    }, 5000);
  };

  // ================UPI PAYMENT=================
  const upiPaymentHandler = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return navigate("/login");
    }
  
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const upiUrl = buildUpiUrl();
  
    if (isMobile) {
      if (isIOS) {
        setShowUpiApps(true);
        return;
      }

      openUpiUrl();
    } else {
      // ✅ Desktop → Generate QR
      try {
        const qr = await QRCode.toDataURL(upiUrl);
        setQrCode(qr);
        setShowQR(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to generate QR");
      }
    }
  };

  // ================= RAZORPAY =================
  const paymentHandler = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("Please login first");
        return navigate("/login");
      }
  
      // 🔹 Step 1: Create order
      const { data: order } = await axios.post(
        `${backendUrl}/payment/order`,
        {
          amount: deal.price * 100,
          currency: "INR",
          receipt: "receipt_" + Date.now(),
          
          
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // 🔹 Step 2: Razorpay popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "DealDine",
        description: deal.dealName,
  
        handler: async function (response) {
          try {
            // 🔹 Step 3: Validate + create coupon
            const { data: validateRes } = await axios.post(
              `${backendUrl}/payment/validate`,
              { ...response, dealId },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
  
            if (validateRes.success) {
              toast.success("Payment Successful 🎉");
              navigate(`/coupon/${validateRes.coupon._id}`);
            } else {
              toast.error(validateRes.message);
            }
  
          } catch (err) {
            console.error(err);
            toast.error("Validation failed");
          }
        },
  
        theme: { color: "#000000" },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
  
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
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
        `${backendUrl}/payment/pay-with-credits`,
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

              {/* Razorpay */}
              <button
                onClick={upiPaymentHandler}
                className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
              >
                Pay Online
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
      {showQR && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl text-center w-80">
      <h2 className="text-xl font-semibold mb-4">Scan & Pay</h2>

      <img src={qrCode} alt="UPI QR" className="mx-auto mb-4" />

      <p className="text-sm text-gray-600 mb-4">
        Scan this QR using any UPI app
      </p>

      <button
        onClick={() => {
          setShowQR(false);
          navigate(`/verify-payment/${dealId}`);
        }}
        className="w-full bg-black text-white py-2 rounded-lg"
      >
        I have paid
      </button>

      <button
        onClick={() => setShowQR(false)}
        className="mt-2 text-sm text-gray-500"
      >
        Cancel
      </button>
    </div>
  </div>
)}
      {showUpiApps && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center w-80">
            <h2 className="text-xl font-semibold mb-2">Choose UPI App</h2>

            <p className="text-sm text-gray-600 mb-4">
              On iPhone, opening a generic UPI link can jump to WhatsApp. Pick a
              UPI app directly.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => openUpiUrl("tez://upi/pay")}
                className="w-full bg-black text-white py-2 rounded-lg"
              >
                Open Google Pay
              </button>

              <button
                onClick={() => openUpiUrl("phonepe://pay")}
                className="w-full bg-gray-900 text-white py-2 rounded-lg"
              >
                Open PhonePe
              </button>

              <button
                onClick={() => openUpiUrl("paytmmp://pay")}
                className="w-full bg-gray-800 text-white py-2 rounded-lg"
              >
                Open Paytm
              </button>

              <button
                onClick={() => openUpiUrl("upi://pay")}
                className="w-full border border-gray-300 py-2 rounded-lg"
              >
                Other UPI Apps
              </button>
            </div>

            <button
              onClick={() => setShowUpiApps(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
