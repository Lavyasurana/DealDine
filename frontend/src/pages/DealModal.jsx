import { useParams } from "react-router-dom";
import { Clock, ChevronDown } from "lucide-react";
import { useEffect, useContext, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import DiscountCard from "../components/DiscountCard";
import { toast } from "react-toastify";
import { formatDateTime } from "../utils/dateTime";


export function DealModal() {
  const { dealId } = useParams();

  const { liveDeals, navigate, userLogin } =
    useContext(rescueContext);

  const [open, setOpen] = useState(false);
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

  const checkoutHandler = () => {
    if (!userLogin) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    navigate(`/checkout/${dealId}`);
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <img
              src={deal.image}
              alt={deal.resName}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-6 space-y-4">
            <h1 className="text-3xl font-bold">{deal.resName}</h1>

            <p className="text-green-600 font-semibold text-lg">
              {deal.dealName}
            </p>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <p>Valid From: {formatDateTime(deal.validFrom)}</p>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <p>Valid Till: {formatDateTime(deal.validTill)}</p>
            </div>

            <p className="text-sm text-gray-500">{deal.location}</p>

            {/* 💰 PRICE + PAYMENT */}
            <div className="pt-4 border-t space-y-3">
              <span className="text-3xl font-bold">₹{deal.price}</span>

              <button
                onClick={checkoutHandler}
                className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition"
              >
                Continue to Checkout
              </button>
              <p className="text-sm text-gray-500 text-center">
                Credits are automatically applied on the checkout page.
              </p>
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
