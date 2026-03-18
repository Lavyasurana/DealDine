import { use, useContext, useEffect } from "react"
import { rescueContext } from "../context/rescueContext"
import { Ticket } from "lucide-react";
import { UpcomingDealTemplate } from "../components/UpcomingDealTemplate";
import { useState } from "react";


export function Upcoming(){

    const{liveDeals}=useContext(rescueContext);
    

    const upcomingDeals = liveDeals?.filter(deal => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
    
      const dealDate = new Date(deal.validFrom);
      dealDate.setHours(0, 0, 0, 0);
    
      return dealDate > today;
    }) || [];

useEffect(() => {
    console.log("Upcoming Deals:", upcomingDeals);
}, [upcomingDeals]);


    return(
        <div>
               <div className="mt-20 ">
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <Ticket className="text-emerald-600" /> Upcoming Deals
          </h2>

          {upcomingDeals.length > 0 ? (
  <div className="mx-5 mt-8">

    {upcomingDeals.map((deal) => (
      <UpcomingDealTemplate key={deal._id} deal={deal}/>
    ))}
  </div>
) : (
  <div>No upcoming deals</div>
)}
        </div>
        </div>
    )
}