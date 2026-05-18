import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { adminContext } from "../context/adminContext";
import { formatDateTime } from "../utils/dateTime";

const RedeemCoupon = () => {
  const [couponId, setCouponId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [redeemedCoupons, setRedeemedCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [savingCouponId, setSavingCouponId] = useState("");
  const { backendUrl } = useContext(adminContext);

  const fetchRedeemedCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await axios.get(`${backendUrl}/coupon/admin/redeemed`);

      if (res.data.success) {
        setRedeemedCoupons(
          res.data.coupons.map((coupon) => ({
            ...coupon,
            billAmountInput:
              coupon.bill?.billAmount === undefined || coupon.bill?.billAmount === null
                ? ""
                : String(coupon.bill.billAmount),
          }))
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchRedeemedCoupons();
  }, []);

  const redeemHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`${backendUrl}/coupon/redeem/${couponId}`);

      if (res.data.success) {
        setSuccess(true);
        setMessage(res.data.message);
        setCouponId("");
        fetchRedeemedCoupons();
      }
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || "Server error");
    }
  };

  const billInputChangeHandler = (couponIdToUpdate, value) => {
    setRedeemedCoupons((prev) =>
      prev.map((coupon) =>
        coupon._id === couponIdToUpdate
          ? { ...coupon, billAmountInput: value }
          : coupon
      )
    );
  };

  const saveBillHandler = async (coupon) => {
    try {
      setSavingCouponId(coupon._id);

      const { data } = await axios.put(`${backendUrl}/coupon/bill/${coupon._id}`, {
        billAmount: coupon.billAmountInput,
      });

      setRedeemedCoupons((prev) => prev.filter((item) => item._id !== coupon._id));

      setSuccess(true);
      setMessage(data.message);
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || "Failed to save bill amount");
    } finally {
      setSavingCouponId("");
    }
  };

  return (
    <div className="w-[90%] ml-[max(5vw,25px)] mt-10 space-y-10">
      <div>
        <h2 className="text-2xl font-semibold mb-6">Redeem Coupon</h2>

        <form onSubmit={redeemHandler} className="flex flex-col gap-4 w-[400px]">
          <input
            type="text"
            placeholder="Enter 8-character Coupon ID"
            value={couponId}
            onChange={(e) => setCouponId(e.target.value)}
            required
            className="border p-3 rounded"
          />

          <button
            type="submit"
            className="bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600"
          >
            Redeem Coupon
          </button>
        </form>

        <p className="mt-3 text-sm text-gray-500">
          Redeem the coupon when the customer arrives. Enter the bill amount later in the table below.
        </p>

        {message && (
          <div
            className={`mt-6 p-3 rounded ${
              success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Pending Bills Table</h3>
          <button
            onClick={fetchRedeemedCoupons}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto bg-white border rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Coupon ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Deal</th>
                <th className="px-4 py-3 text-left">Redeemed At</th>
                <th className="px-4 py-3 text-left">Bill Amount</th>
              </tr>
            </thead>
            <tbody>
              {loadingCoupons ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    Loading redeemed coupons...
                  </td>
                </tr>
              ) : redeemedCoupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                    No pending bill entries.
                  </td>
                </tr>
              ) : (
                redeemedCoupons.map((coupon) => (
                  <tr key={coupon._id} className="border-t align-top">
                    <td className="px-4 py-3 font-mono text-xs">{coupon.couponCode || coupon._id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {coupon.user?.firstName} {coupon.user?.lastName}
                      </p>
                      <p className="text-gray-500">{coupon.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{coupon.deal?.dealName}</p>
                      <p className="text-gray-500">{coupon.deal?.resName}</p>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(coupon.usedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex min-w-[220px] items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={coupon.billAmountInput}
                          onChange={(e) => billInputChangeHandler(coupon._id, e.target.value)}
                          placeholder="Enter bill amount"
                          className="border p-2 rounded flex-1"
                        />
                        <button
                          onClick={() => saveBillHandler(coupon)}
                          disabled={savingCouponId === coupon._id}
                          className="shrink-0 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
                        >
                          {savingCouponId === coupon._id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RedeemCoupon;
