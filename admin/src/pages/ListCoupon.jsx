import React, { useContext, useEffect, useState } from "react"
import axios from "axios"
import { adminContext } from "../context/adminContext"
import { formatDateTime } from "../utils/dateTime"

const ListCoupons = () => {

  const [deals,setDeals] = useState([])
  const{backendUrl}=useContext(adminContext)

  const fetchDeals = async()=>{

    try{

      const res = await axios.get(
        `${backendUrl}/api/deals/admin-coupons`
      )

      if(res.data.success){
        setDeals(res.data.deals)
      }

    }catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    fetchDeals()
  },[])

  return (
    <div className="w-[70%] ml-[max(5vw,25px)] mt-10">

      <h2 className="text-2xl font-semibold mb-6">
        My Coupons
      </h2>

      <div className="grid gap-4">

        {deals.map((deal)=>(
          <div
            key={deal._id}
            className="border p-4 rounded flex justify-between items-center"
          >

            <div>
              <p className="font-semibold">
                {deal.dealName}
              </p>

              <p className="text-gray-500 text-sm">
                {deal.resName}
              </p>

              <p className="text-sm">
                ₹{deal.price}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Valid From
              </p>

              <p className="mb-2">
                {formatDateTime(deal.validFrom)}
              </p>

              <p className="text-sm text-gray-500">
                Valid Till
              </p>

              <p>
                {formatDateTime(deal.validTill)}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}

export default ListCoupons
