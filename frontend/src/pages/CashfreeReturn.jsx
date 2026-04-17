import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";

const MAX_CONFIRM_RETRIES = 8;
const RETRY_DELAY_MS = 2000;

export function CashfreeReturn() {
  const [searchParams] = useSearchParams();
  const { backendUrl, navigate, getUser, userLogin, authReady } = useContext(rescueContext);
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const confirmPayment = async () => {
      const orderId = searchParams.get("order_id");
      if (!authReady) {
        return;
      }

      if (!orderId || !userLogin) {
        setStatus("failed");
        setMessage("Missing payment details. Please log in and try again.");
        return;
      }

      for (let attempt = 0; attempt < MAX_CONFIRM_RETRIES; attempt += 1) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/payment/cashfree/confirm/${orderId}`,
            { withCredentials: true }
          );

          if (data.success && data.coupon?._id) {
            await getUser();
            navigate(`/coupon/${data.coupon._id}`, { replace: true });
            return;
          }

          setStatus("failed");
          setMessage(data.message || "Payment could not be confirmed.");
          return;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Payment could not be confirmed.";
          const isPending =
            errorMessage === "Payment is still pending" ||
            errorMessage === "This deal is being purchased right now. Please try again.";
          const hasRetriesLeft = attempt < MAX_CONFIRM_RETRIES - 1;

          if (isPending && hasRetriesLeft) {
            setMessage("Payment received. Waiting for confirmation from Cashfree...");
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            continue;
          }

          setStatus("failed");
          setMessage(errorMessage);
          return;
        }
      }
    };

    confirmPayment();
  }, [authReady, backendUrl, getUser, navigate, searchParams, userLogin]);

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
