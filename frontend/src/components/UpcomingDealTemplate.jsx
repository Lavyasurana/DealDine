import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function UpcomingDealTemplate({ deal }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const start = new Date(deal.validFrom);
      
        const diff = start - now;
      
        if (diff <= 0) {
          setTimeLeft("Live now 🔥");
          return;
        }
      
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);
      
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
      
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      };
    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 60000); // update every minute

    return () => clearInterval(timer);
  }, [deal.validFrom]);

  return (
    <Link to={`/getDeals/${deal._id}`}>
      <div className="mt-6 bg-white rounded-2xl shadow-md p-6 border border-emerald-100 hover:shadow-xl hover:-translate-y-1 transition duration-300">

        <div className="flex justify-between items-center">

          {/* Left */}
          <div>
            <h3 className="font-semibold text-lg text-gray-800">
              {deal.resName}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {deal.dealName}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Starts on:{" "}
              {new Date(deal.validFrom).toLocaleDateString("en-IN")}
            </p>

            {/* 🔥 Countdown */}
            <p className="mt-2 text-sm font-medium text-emerald-600">
              ⏳ Starts in: {timeLeft}
            </p>
          </div>

          {/* Right */}
          <div>
            <button className="bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 transition font-medium">
              View Deal
            </button>
          </div>

        </div>
      </div>
    </Link>
  );
}