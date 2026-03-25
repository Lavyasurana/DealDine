import { Link } from "react-router-dom"

export function Restaurant({admin}){

return(
    <Link  >
    <div className="flex justify-between items-start gap-4">

      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {admin.restaurantName}
        </h3>
        <p className="text-sm">{admin.town}</p>

      </div>

      
        <img
          src={admin.imageUrl}
          alt="restaurant"
          className="w-16 h-16 object-cover rounded-lg"
        />
      
    </div>

    <button className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition">
      View All deals on search
    </button>
  </Link>
)
}
