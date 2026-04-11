import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";

export function CashfreeReturn() {
  const [searchParams] = useSearchParams();
  const { backendUrl, navigate, getUser } = useContext(rescueContext);
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const confirmPayment = async () => {
      const orderId = searchParams.get("order_id");
      const token = localStorage.getItem("token");

      if (!orderId || !token) {
        setStatus("failed");
        setMessage("Missing payment details. Please log in and try again.");
        return;
      }

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/payment/cashfree/confirm/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          await getUser();
          navigate(`/coupon/${data.coupon._id}`, { replace: true });
          return;
        }

        setStatus("failed");
        setMessage(data.message || "Payment could not be confirmed.");
      } catch (error) {
        setStatus("failed");
        setMessage(error.response?.data?.message || "Payment could not be confirmed.");
      }
    };

    confirmPayment();
  }, [backendUrl, getUser, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-3">
          {status === "verifying" ? "Verifying Payment" : "Payment Update"}
        </h2>
        <p className="text-gray-600">{message}</p>
        {status === "verifying" && (
          <div className="mt-6 flex justify-center">
            <div className="h-10 w-10 rounded-full border-b-2 border-black animate-spin"></div>
          </div>
        )}
        {status === "failed" && (
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-black text-white px-5 py-3 rounded-xl"
          >
            Go Home
          </button>
        )}
      </div>
    </div>
  );
}
