import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";
import { IssuedCouponCard } from "../components/IssuedCouponCard";
import { User, Ticket, Wallet } from "lucide-react";

export function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [coupons, setCoupons] = useState([]);
  const [user, setUser] = useState(null);

  const { backendUrl,userCredits, clearAuthState, navigate } = useContext(rescueContext);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const userRes = await axios.get(`${backendUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(userRes.data.user);

        const couponRes = await axios.get(`${backendUrl}/coupon/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (couponRes.data.success) {
          setCoupons(couponRes.data.coupons);
        }
      } catch (error) {
        console.log(error.response?.data);

        if (error.response?.status === 401) {
          clearAuthState();
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [backendUrl, clearAuthState, navigate]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">

      {/* 🔥 SIDEBAR */}
      <div className="w-64 bg-white/80 backdrop-blur-lg shadow-xl p-6 space-y-6 border-r">
        <h2 className="text-2xl font-bold">DealDine</h2>

        <div className="space-y-2">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition ${
              activeTab === "info"
                ? "bg-black text-white shadow-md"
                : "hover:bg-gray-200"
            }`}
          >
            <User size={18} /> Profile
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition ${
              activeTab === "coupons"
                ? "bg-black text-white shadow-md"
                : "hover:bg-gray-200"
            }`}
          >
            <Ticket size={18} /> Coupons
          </button>
        </div>
      </div>

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-10">

        {/* ================= PROFILE TAB ================= */}
        {activeTab === "info" && user && (
          <div className="space-y-6 max-w-3xl">

            {/* 👤 PROFILE CARD */}
            <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
                {user.firstName[0]}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* 💳 WALLET CARD */}
            <div className="bg-gradient-to-r from-black to-gray-800 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <p className="text-sm opacity-70">Available Credits</p>
                <h2 className="text-3xl font-bold">₹{userCredits}</h2>
              </div>

              <Wallet size={32} className="opacity-80" />
            </div>

            {/* 📄 DETAILS */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold mb-2">
                Account Details
              </h3>

              <p className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{user.phone}</span>
              </p>

              <p className="flex justify-between">
                <span className="text-gray-500">User ID</span>
                <span>{user.userId}</span>
              </p>
            </div>
          </div>
        )}

        {/* ================= COUPONS TAB ================= */}
        {activeTab === "coupons" && (
          <div>
            <h2 className="text-3xl font-bold mb-6">
              Your Coupons 🎟
            </h2>

            {coupons.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-500">
                No coupons yet. Grab your first deal 🚀
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                  <IssuedCouponCard
                    key={coupon._id}
                    coupon={coupon}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
