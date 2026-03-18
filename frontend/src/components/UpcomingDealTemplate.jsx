import { Link } from "react-router-dom"

export function UpcomingDealTemplate({ deal }) {
    return (
        <Link to={`/getDeals/${deal._id}`}>
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-emerald-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-semibold">
                        {deal.resName}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {deal.dealName}
                    </p>
                    <p>
                        Validity - {new Date(deal.validFrom).toLocaleDateString("en-IN")}</p>
                </div>
                <div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition mx-5">
                        Get deal
                    </button>

                    <button className="bg-emerald-400 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition">
                        Remind Me
                    </button>
                </div>
            </div>
        </div>
        </Link>
    )
}