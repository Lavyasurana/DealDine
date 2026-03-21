import { useContext, useEffect } from "react";
import { rescueContext } from "../context/rescueContext";
import { Ticket } from "lucide-react";
import { UpcomingDealTemplate } from "../components/UpcomingDealTemplate";

export function Upcoming() {
  const { liveDeals } = useContext(rescueContext);

  const upcomingDeals =
    liveDeals?.filter((deal) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dealDate = new Date(deal.validFrom);
      dealDate.setHours(0, 0, 0, 0);

      return dealDate > today;
    }) || [];

  useEffect(() => {
    console.log("Upcoming Deals:", upcomingDeals);
  }, [upcomingDeals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 px-6 py-24">

      {/* Heading */}
      <h2 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
        <Ticket className="text-emerald-600" />
        Deals Dropping Soon ⏳
      </h2>

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