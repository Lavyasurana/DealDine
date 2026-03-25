import React, { useState, useContext,useEffect } from "react";
import { Flame } from "lucide-react";
import DiscountCard from "../components/DiscountCard";
import top from "../assets/top.png";
import { rescueContext } from "../context/rescueContext";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";
export default function Home() {
  const { liveDeals, loading,backendUrl,user,userLogin } = useContext(rescueContext);

  const [currentPage, setCurrentPage] = useState(1);
  const[showBanner,setShowBanner]=useState(false);
  const dealsPerPage = 9;

useEffect(() => {
  const timer = setTimeout(() => {
    // Only show if not already accepted/denied
    if (Notification.permission === "default") {
      setShowBanner(true);
    }
  }, 2000); // 10 sec delay

  return () => clearTimeout(timer);
}, [userLogin]);
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log("✅ SW registered:", registration);
      })
      .catch((err) => {
        console.log("❌ SW failed:", err);
      });
  }
}, []);

  // 🔥 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Waking up server... this may take a few seconds 🚀
          </p>
        </div>
      </div>
    );
  }

  // ❌ EMPTY STATE
  if (!liveDeals || liveDeals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No current deals available
      </div>
    );
  }

  // Pagination logic
  const indexOfLastDeal = currentPage * dealsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - dealsPerPage;
  const currentDeals = liveDeals.slice(indexOfFirstDeal, indexOfLastDeal);

  const totalPages = Math.ceil(liveDeals.length / dealsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

 




  const handleEnableNotifications = async () => {
    const permission = await Notification.requestPermission();
  
    if (permission === "granted") {
      try {
        // ✅ THIS WAS MISSING
        const registration = await navigator.serviceWorker.ready;
  
        const fcmToken = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });
  
        console.log("🔥 FCM Token:", fcmToken);
  
        const authToken = localStorage.getItem("token");
  
        await fetch(`${backendUrl}/api/user/save-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ token: fcmToken })
        });
  
        localStorage.setItem("fcmToken", fcmToken);
  
        setShowBanner(false);
  
      } catch (err) {
        console.error("Error getting token:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 pt-20 px-4 sm:px-6 py-10 text-gray-900">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-emerald-700 tracking-tight">
          DealDine
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-700">
          Discover hidden restaurant discounts before they disappear.
        </p>
      </div>
      {userLogin && showBanner && (
  <div className="max-w-3xl mx-auto mt-6 bg-white border border-emerald-200 shadow-md rounded-xl p-4 flex items-center justify-between gap-4">
    
    <div>
      <p className="text-sm sm:text-base font-medium text-gray-800">
        🔔 Never miss deals near you!
      </p>
      <p className="text-xs text-gray-500">
        Get instant alerts when new offers drop 🔥
      </p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={handleEnableNotifications}
        className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
      >
        Enable
      </button>

      <button
        onClick={() => setShowBanner(false)}
        className="text-gray-500 text-sm px-2"
      >
        ✕
      </button>
    </div>
  </div>
)}

      {/* Banner Section */}
      <div
        style={{ backgroundImage: `url(${top})` }}
        className="w-full max-w-5xl mx-auto h-28 sm:h-40 bg-cover bg-center rounded-2xl mt-10 sm:mt-12 flex items-center justify-center"
      >
        <h1 className="font-bold text-2xl sm:text-5xl text-white drop-shadow-lg text-center px-2">
          BUY 1 GET 1 FREE
        </h1>
      </div>

      {/* Live Deals */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 flex items-center gap-2">
          <Flame className="text-emerald-600" /> All deals
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-6 sm:mt-8">
          {currentDeals.map((deal) => (
            <DiscountCard
              key={deal._id}
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

        {/* Pagination */}
        <div className="flex justify-center mt-8 sm:mt-10 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition ${
                currentPage === index + 1
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-emerald-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}