import React, { useState } from "react"
import axios from "axios"
import { useContext } from "react"
import {adminContext} from "../context/adminContext";
import {toast} from 'react-toastify';

const AddCoupon = () => {

  const{backendUrl}=useContext(adminContext);
  const [loading, setLoading] = useState(false);
  const [data,setData] = useState({
    
    dealName:"",
    description:"",
    price:"",
  
    validFrom:"",
    validTill:"",
    
  })

  const handleChange = (e)=>{
    setData({...data,[e.target.name]:e.target.value})
  }

  const submitHandler = async(e)=>{
    e.preventDefault()
    if (loading) return;

    try{
      const res = await axios.post(`${backendUrl}/api/deals/addDeal`,data)

      if(res.data.success){
        toast.success('coupon added successfully')
        setData({
          
          dealName:"",
          description:"",
          price:"",
         
          validFrom:"",
          validTill:"",
          
        })
      }

    }catch(err){
      console.log(err)
      toast.error("Error adding coupon")
    }
    finally {
      setLoading(false); 
    }
  }

  return (
    <div className="w-[70%] ml-[max(5vw,25px)] mt-10">

      <form onSubmit={submitHandler} className="flex flex-col gap-4">

        

        <input
          type="text"
          name="dealName"
          placeholder="Deal Name"
          value={data.dealName}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={data.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={data.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />

       

        <label>Valid From</label>
        <input
          type="datetime-local"
          name="validFrom"
          value={data.validFrom}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <label>Valid Till</label>
        <input
          type="datetime-local"
          name="validTill"
          value={data.validTill}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        

        <button
          type="submit"
          className="bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600"
        >
          Add Coupon
        </button>

      </form>

    </div>
  )
}

export default AddCoupon