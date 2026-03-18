import React from "react";
import { Flame, Ticket, MapPin } from "lucide-react";
import DiscountCard from "../components/DiscountCard";


import top from "../assets/top.png";

import { useContext } from "react";
import { rescueContext } from "../context/rescueContext";

export default function Home() {
  const{liveDeals}=useContext(rescueContext);
  if (!liveDeals)return <div>No current deals</div>


  return (
    <>
    

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 pt-24 px-6 py-10 text-gray-900">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-emerald-700 tracking-tight">
            DealDine
          </h1>

          <p className="mt-4 text-lg text-gray-700">
            Discover hidden restaurant discounts before they disappear.
          </p>
        </div>

        {/* Banner Section */}
        <div
          style={{ backgroundImage: `url(${top})` }}
          className="w-full max-w-5xl mx-auto sm:h-40 h-28 bg-cover bg-center rounded-2xl mt-12 flex items-center justify-center"
        >
          <h1 className="font-bold text-4xl sm:text-5xl text-white drop-shadow-lg">
            BUY 1 GET 1 FREE
          </h1>
        </div>

        {/* Live Deals */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
            <Flame className="text-emerald-600" />All deals
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {liveDeals.map((deal) => (
              <DiscountCard
                key={deal.id}
                name={deal.resName}
                offer={deal.dealName}
                validTime={deal.validTime}
                image={deal.image}
                dealId={deal._id}
                validFrom={deal.validFrom}
                validTill={deal.validTill}
                price={deal.price}
              />
            ))}
          </div>
        </div>

       
        

      </div>
    </>
  );
}