import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UpcomingDealTemplate } from "../components/UpcomingDealTemplate";
import { rescueContext } from "../context/rescueContext";
import { Search as SearchIcon } from "lucide-react";
import { Restaurant } from "../components/Restaurant";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [admins, setAdmins] = useState([]);

  const { backendUrl } = useContext(rescueContext);

  // 🔍 Search Deals
  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 1) {
        setResults([]);
        return;
      }

      try {
        const res = await axios.get(
          `${backendUrl}/api/deals/search?query=${query}`
        );

        if (res.data.success) {
          setResults(res.data.deals);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // 🍽️ Fetch all restaurants
  useEffect(() => {
    const getAllAdmins = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/getallAdmin`);
        if (res.data.success) {
          setAdmins(res.data.admins);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getAllAdmins();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 px-4 py-12">

      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-emerald-700">
          Search Deals 🔍
        </h1>
        <p className="text-gray-600 mt-2">
          Find the best restaurant offers near you
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <SearchIcon className="absolute left-4 top-3.5 text-gray-400" size={20} />
        
        <input
          type="text"
          placeholder="Search restaurants, cuisines..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      {/* Results / Restaurants */}
      <div className="max-w-4xl mx-auto mt-10">

        {/* ✅ SHOW RESTAURANTS WHEN NO SEARCH */}
        {query.length === 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              🍽️ Our Restaurant Partners
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-6 sm:mt-8">
              {admins.map((admin, index) => (
                <Restaurant key={index} admin={admin} />
              ))}
            </div>
          </>
        )}

        {/* ❌ No Results */}
        {query.length > 0 && results.length === 0 && (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-lg">😕 No deals found</p>
            <p className="text-sm mt-1">Try a different restaurant name</p>
          </div>
        )}

        {/* ✅ Search Results */}
        {query.length > 0 && (
          <div className="grid gap-6">
            {results.map((deal, index) => (
              <div
                key={deal._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-4 animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <UpcomingDealTemplate deal={deal} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;