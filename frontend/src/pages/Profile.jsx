import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";
import { IssuedCouponCard } from "../components/IssuedCouponCard";
import { User, Ticket, Wallet } from "lucide-react";
import { toast } from "react-toastify";

export function Profile() {
  const [activeTab, setActiveTab] = useState("info");
  const [coupons, setCoupons] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  const { backendUrl,userCredits, clearAuthState, navigate, userLogin, authReady } = useContext(rescueContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!authReady) return;
      if (!userLogin) {
        navigate("/login");
        return;
      }

      try {
        const userRes = await axios.get(`${backendUrl}/api/user/me`, { withCredentials: true });

        setUser(userRes.data.user);
        setPhone(userRes.data.user.phone || "");

        const couponRes = await axios.get(`${backendUrl}/coupon/my`, { withCredentials: true });

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
  }, [authReady, backendUrl, clearAuthState, navigate, userLogin]);

  const savePhoneNumber = async () => {
    try {
      if (!userLogin) {
        clearAuthState();
        navigate("/login");
        return;
      }

      setSavingPhone(true);

      const { data } = await axios.put(
        `${backendUrl}/api/user/me`,
        { phone },
        { withCredentials: true }
      );

      if (data.success) {
        setUser(data.user);
        setPhone(data.user.phone || "");
        setIsEditingPhone(false);
        toast.success("Mobile number updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clearAuthState();
        navigate("/login");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to update mobile number");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 lg:flex">

      {/* 🔥 SIDEBAR */}
      <div className="hidden w-64 bg-white/80 backdrop-blur-lg shadow-xl p-6 space-y-6 border-r lg:block">
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
      <div className="flex-1 px-4 py-6 sm:px-6 lg:p-10">
        <div className="mb-6 space-y-4 lg:hidden">
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900">DealDine</h2>
            <p className="mt-1 text-sm text-gray-500">Profile and coupons</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                activeTab === "info"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <User size={18} /> Profile
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                activeTab === "coupons"
                  ? "bg-black text-white shadow-md"
                  : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              <Ticket size={18} /> Coupons
            </button>
          </div>
        </div>

        {/* ================= PROFILE TAB ================= */}
        {activeTab === "info" && user && (
          <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">

            {/* 👤 PROFILE CARD */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:gap-6 sm:p-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-xl">
                {user.firstName[0]}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold sm:text-2xl">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="break-all text-sm text-gray-500 sm:text-base">{user.email}</p>
              </div>
            </div>

            {/* 💳 WALLET CARD */}
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-black to-gray-800 p-5 text-white shadow-lg sm:p-6">
              <div>
                <p className="text-sm opacity-70">Available Credits</p>
                <h2 className="text-2xl font-bold sm:text-3xl">₹{userCredits}</h2>
              </div>

              <Wallet size={32} className="opacity-80" />
            </div>

            {/* 📄 DETAILS */}
            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-lg sm:p-6">
              <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold">
                  Account Details
                </h3>

                {!isEditingPhone ? (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="self-start text-sm font-medium text-emerald-600"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-3 text-sm">
                    <button
                      onClick={savePhoneNumber}
                      disabled={savingPhone}
                      className="text-emerald-600 font-medium disabled:text-gray-400"
                    >
                      {savingPhone ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setPhone(user.phone || "");
                        setIsEditingPhone(false);
                      }}
                      className="text-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-sm text-gray-500 sm:text-base">Phone</span>
                {isEditingPhone ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 sm:max-w-xs sm:text-right"
                  />
                ) : (
                  <span className="break-all sm:text-right">{user.phone}</span>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-500 sm:text-base">User ID</span>
                <span className="break-all font-mono text-sm sm:text-right">{user.userId}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= COUPONS TAB ================= */}
        {activeTab === "coupons" && (
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold sm:text-3xl">
              Your Coupons 🎟
            </h2>

            {coupons.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow sm:p-10">
                No coupons yet. Grab your first deal 🚀
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
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
