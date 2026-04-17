import { Link } from "react-router-dom";

export default function DiscountCard({
  name,
  offer,
  validFrom,
  validTill,
  image,
  price,
  dealId
}) {
  return (
    <Link to={`/getDeals/${dealId}`} className="block">
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.02] transition cursor-pointer">

      {/* IMAGE */}
      <img
        src={image}
        alt={name}
        className="w-full h-44 object-cover"
      />

      {/* CONTENT */}
      <div className="p-4 space-y-3">

        {/* 💰 PRICE (NOW BELOW IMAGE) */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-black">
            ₹{price}
          </p>

          <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition">
            View Deal
          </button>
        </div>

        {/* 🔥 DEAL TITLE (MAIN FOCUS) */}
        <h2 className="text-lg font-bold text-green-600 leading-snug">
          {offer}
        </h2>

        {/* 🏪 RESTAURANT */}
        <p className="text-sm text-gray-600 font-medium">
          {name}
        </p>

        {/* 🕒 DATE + TIME */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            From:{" "}
            {new Date(validFrom).toLocaleString()}
          </p>
          <p>
            Till:{" "}
            {new Date(validTill).toLocaleString()}
          </p>
        </div>

      </div>
    </div>
    </Link>
  );
}