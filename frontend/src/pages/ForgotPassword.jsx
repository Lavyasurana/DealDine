import React, { useState, useContext } from "react";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(rescueContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${backendUrl}/api/user/forgot-password`,
        { email }
      );

      if (res.data.success) {
        setMessage("✅ Reset link sent to your email");
      } else {
        setMessage("❌ Something went wrong");
      }
    } catch (error) {
      setMessage("❌ Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-center text-emerald-700">
          Forgot Password
        </h2>

        <p className="text-gray-500 text-center mt-2">
          Enter your email to receive a reset link
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}