import React, { useContext } from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { rescueContext } from "../context/rescueContext";
import { formatDateTime } from "../utils/dateTime";



export default function DiscountCard({
  name,
  offer,
  validFrom,
  validTill,
  image,
  dealId,
  price
}) {

  const{backendUrl}=useContext(rescueContext);


  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg hover:shadow-emerald-200 transition duration-300">
      <Link to={`/getDeals/${dealId}`}>
        <div className="flex justify-between items-start gap-4">

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {name}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {offer}
            </p>


            <div className="text-sm text-emerald-600 mt-3 space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <p>Valid From: {formatDateTime(validFrom)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <p>Valid Till   : {formatDateTime(validTill)}</p>
              </div>
            </div>
            {/* 🔥 Price Added Here */}
            <p className="text-emerald-700 font-bold mt-2 text-base">
              Price:₹{price}
            </p>
          </div>

          {image && (
            <img
              src={image}
              alt="restaurant"
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
        </div>

        <button className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition">
          Grab Deal
        </button>
      </Link>
    </div>
  );
}
