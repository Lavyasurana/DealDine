import { useState, useContext, useEffect } from "react"; // Added useEffect here
import { useParams } from "react-router-dom";
import { rescueContext } from "../context/rescueContext";
import axios from "axios";
import { toast } from "react-toastify";

export function VerifyPayment() {
  const { dealId } = useParams();
  const { backendUrl, navigate } = useContext(rescueContext);
  
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [utr, setUtr] = useState(null); // State to trigger polling

  const handleFileChange = (e) => {
    setScreenshot(e.target.files[0]);
  };

  // 1. POLLING LOGIC: This watches the 'utr' state
  useEffect(() => {
    let interval;
    if (utr) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get(`${backendUrl}/api/payment/status/${utr}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (data.status === "approved") {
            toast.success("Payment Confirmed! 🎉");
            clearInterval(interval);
            navigate("/profile"); 
          }
        } catch (err) {
          console.log("Waiting for bank confirmation...");
        }
      }, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [utr, backendUrl, navigate]);

  // 2. UPLOAD LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) return toast.error("Please upload a screenshot");

    const formData = new FormData();
    formData.append("screenshot", screenshot);
    formData.append("dealId", dealId);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        `${backendUrl}/api/payment/verify-vision`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          },
        }
      );

      if (data.success) {
        toast.success("Screenshot received! Verifying with bank...");
        setUtr(data.utr); // 🚀 This starts the useEffect polling
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center">
          {utr ? "Verifying..." : "Upload Receipt"}
        </h2>
        <p className="text-gray-500 text-center mt-2 mb-6">
          {utr 
            ? "AI has read your receipt. We are now waiting for the bank's SMS confirmation." 
            : "Upload the GPay/PhonePe success screen for instant AI verification."}
        </p>

        {!utr ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
                id="fileInput" 
              />
              <label htmlFor="fileInput" className="cursor-pointer block">
                {screenshot ? screenshot.name : "Click to select screenshot"}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? "AI Processing..." : "Verify Payment"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <p className="text-sm font-medium">Please don't close this page...</p>
          </div>
        )}
      </div>
    </div>
  );
}