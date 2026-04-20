import { useContext, useEffect } from "react";
import { rescueContext } from "../context/rescueContext";
import { Ticket } from "lucide-react";
import { UpcomingDealTemplate } from "../components/UpcomingDealTemplate";
import { parseBackendDateTime } from "../utils/dateTime";

export function Upcoming() {
  const { liveDeals } = useContext(rescueContext);

  const upcomingDeals =
    liveDeals?.filter((deal) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextFiveDays = new Date(today);
      nextFiveDays.setDate(nextFiveDays.getDate() + 5);

      const dealDate = parseBackendDateTime(deal.validFrom);

      if (!dealDate) {
        return false;
      }

      dealDate.setHours(0, 0, 0, 0);

      return dealDate > today && dealDate <= nextFiveDays;
    }) || [];



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 px-4 py-24 sm:px-6">

      {/* Heading */}
      <div className="flex items-start gap-3 sm:items-center">
        <Ticket className="mt-1 h-7 w-7 shrink-0 text-emerald-600 sm:mt-0 sm:h-8 sm:w-8" />
        <h2 className="text-2xl font-bold leading-tight text-emerald-700 sm:text-3xl">
          Deals Dropping Soon ⏳
        </h2>
      </div>

      {/* Subtext */}
      <p className="text-gray-600 mt-2">
        Grab these deals as soon as they go live
      </p>

      {/* Deals */}
      {upcomingDeals.length > 0 ? (
        <div className="mt-8 max-w-4xl">
          {upcomingDeals.map((deal) => (
            <UpcomingDealTemplate key={deal._id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center text-gray-500">
          😴 No upcoming deals right now
        </div>
      )}
    </div>
  );
}
