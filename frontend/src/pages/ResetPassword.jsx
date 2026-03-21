import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { backendUrl } = useContext(rescueContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/user/reset-password`,
        {
          token,
          newPassword: password,
        }
      );

      if (res.data.success) {
        setMessage("✅ Password reset successful");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage("❌ " + res.data.message);
      }
    } catch (error) {
      setMessage("❌ Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-center text-emerald-700">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition"
          >
            Reset Password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}