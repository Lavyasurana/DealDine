import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import {adminContext} from "../context/adminContext"
import axios from "axios";

const Navbar = () => {

  const navigate = useNavigate()
  
 
  const{adminLogin,setAdminLogin,backendUrl}=useContext(adminContext)

  const logout = async () => {
    try {
      await axios.post(`${backendUrl}/api/admin/logout`, {}, { withCredentials: true });
    } catch (_error) {
      // Clear local auth state regardless of request result.
    }
    setAdminLogin(false);
    navigate("/login")
  }
  

  return (
    <div className="w-full flex items-center justify-between px-8 py-4 border-b bg-white">

      {/* Logo */}
      <div
        onClick={()=>navigate("/")}
        className="text-2xl font-bold text-emerald-600 cursor-pointer"
      >
        DealDine
      </div>

      {/* Right Side */}
      <div>

        {!adminLogin ? (

          <button
            onClick={()=>navigate("/login")}
            className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600"
          >
            Login
          </button>

        ) : (

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>

        )}

      </div>

    </div>
  )
}

export default Navbar
