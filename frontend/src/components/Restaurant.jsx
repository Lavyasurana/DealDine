export function Restaurant({admin}){

return(
   <div className="h-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-start justify-between gap-4 min-h-[96px]">

        <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold leading-snug text-gray-900">
          {admin.restaurantName}
        </h3>
        <p className="mt-2 text-sm text-gray-600">{admin.town}</p>

        </div>

      
        <img
          src={admin.imageUrl}
          alt="restaurant"
          className="h-16 w-16 flex-shrink-0 object-cover rounded-lg"
        />
      </div>
      
    <button className="mt-auto w-full bg-emerald-600 text-white py-2 rounded-xl hover:bg-emerald-700 transition">
      View All deals on search
    </button>
    </div>
    </div>
)
}
