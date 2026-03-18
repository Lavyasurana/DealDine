import React, { useState } from "react"
import axios from "axios"
import { useContext } from "react"
import { adminContext } from "../context/adminContext"

const RedeemCoupon = () => {

  const [couponId,setCouponId] = useState("")
  const [message,setMessage] = useState("")
  const [success,setSuccess] = useState(false)
  const{backendUrl}=useContext(adminContext);

  const redeemHandler = async(e)=>{
    e.preventDefault()

    try{

      const res = await axios.put(
        `${backendUrl}/coupon/redeem/${couponId}`
      )

      if(res.data.success){
        setSuccess(true)
        setMessage(res.data.message)
        setCouponId("")
      }

    }catch(error){

      setSuccess(false)

      if(error.response){
        setMessage(error.response.data.message)
      }else{
        setMessage("Server error")
      }

    }
  }

  return (
    <div className="w-[70%] ml-[max(5vw,25px)] mt-10">

      <h2 className="text-2xl font-semibold mb-6">
        Redeem Coupon
      </h2>

      <form
        onSubmit={redeemHandler}
        className="flex flex-col gap-4 w-[400px]"
      >

        <input
          type="text"
          placeholder="Enter Coupon ID"
          value={couponId}
          onChange={(e)=>setCouponId(e.target.value)}
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

      {message && (
        <div
          className={`mt-6 p-3 rounded ${
            success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

    </div>
  )
}

export default RedeemCoupon