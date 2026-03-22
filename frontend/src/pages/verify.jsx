import { useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { rescueContext } from "../context/rescueContext";

export default function Verify() {
  const { token } = useParams();
  
  const{backendUrl,navigate}=useContext(rescueContext)

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/user/verify/${token}`
        );

        alert("Email verified successfully ✅");

        navigate("/login");
      } catch (err) {
        alert("Verification failed ❌");
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h2>Verifying your email...</h2>
    </div>
  );
}