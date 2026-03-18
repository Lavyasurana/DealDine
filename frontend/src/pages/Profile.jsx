import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";
import { IssuedCouponCard } from "../components/IssuedCouponCard";

export function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [coupons, setCoupons] = useState([]);
  const [user, setUser] = useState(null);

  const { backendUrl } = useContext(rescueContext);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        // Fetch user info
        const userRes = await axios.get(
          `${backendUrl}/api/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(userRes.data.user);

        // Fetch coupons
        const couponRes = await axios.get(
          `${backendUrl}/coupon/my`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (couponRes.data.success) {
          setCoupons(couponRes.data.coupons);
        }

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Profile</h2>

        <button
          onClick={() => setActiveTab("info")}
          className={`block w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "info" ? "bg-emerald-500 text-white" : "hover:bg-gray-200"
          }`}
        >
          User Info
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`block w-full text-left px-4 py-2 rounded-lg ${
            activeTab === "coupons" ? "bg-emerald-500 text-white" : "hover:bg-gray-200"
          }`}
        >
          Issued Coupons
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10">

        {activeTab === "info" && user && (
          <div className="bg-white p-8 rounded-xl shadow-md max-w-lg">
            <h2 className="text-2xl font-bold mb-4">User Information</h2>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
          </div>
        )}

{activeTab === "coupons" && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Your Coupons</h2>

    {coupons.length === 0 ? (
      <p>No coupons purchased yet.</p>
    ) : (
      <div className="grid gap-6">
        {coupons.map((coupon) => (
          <IssuedCouponCard key={coupon._id} coupon={coupon} />
        ))}
      </div>
    )}
  </div>
)}

      </div>
    </div>
  );
}