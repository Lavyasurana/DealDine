import React, { useState } from "react"
import axios from "axios"
import { useContext } from "react"
import {adminContext} from "../context/adminContext";
import {toast} from 'react-toastify';

const AddCoupon = () => {

  const{backendUrl}=useContext(adminContext);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [data,setData] = useState({
    
    dealName:"",
    description:"",
    price:"",
    maxRedemptions:"",
    startTime:"",
    endTime:"",
    availableDates:[],
    
  })

  const handleChange = (e)=>{
    setData({...data,[e.target.name]:e.target.value})
  }

  const addAvailableDate = () => {
    if (!selectedDate) {
      toast.error("Select a date first");
      return;
    }

    if (data.availableDates.includes(selectedDate)) {
      toast.error("That date is already selected");
      return;
    }

    setData((prev) => ({
      ...prev,
      availableDates: [...prev.availableDates, selectedDate].sort(),
    }));
    setSelectedDate("");
  };

  const removeAvailableDate = (dateToRemove) => {
    setData((prev) => ({
      ...prev,
      availableDates: prev.availableDates.filter((date) => date !== dateToRemove),
    }));
  };

  const submitHandler = async(e)=>{
    e.preventDefault()
    if (loading) return;

    if (!data.startTime || !data.endTime) {
      toast.error("Select both start and end time");
      return;
    }

    if (data.availableDates.length === 0) {
      toast.error("Select at least one available date");
      return;
    }

    setLoading(true); 

    try{
      const res = await axios.post(
        `${backendUrl}/api/deals/addDeal`,
        {
          ...data,
          maxRedemptions: data.maxRedemptions === "" ? undefined : Number(data.maxRedemptions),
        },
        {
          withCredentials: true //  IMPORTANT for jwt
        }
      );
  
      console.log(res.data); 

      if(res.data.success){
        toast.success('coupon added successfully')
        alert("coupon added successfully");
        setData({
          
          dealName:"",
          description:"",
          price:"",
          maxRedemptions:"",
          startTime:"",
          endTime:"",
          availableDates:[],
          
        })
        setSelectedDate("");
      }
      else{
        toast.error(res.data.message)
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

        <input
          type="number"
          name="maxRedemptions"
          placeholder="Total claim limit (optional). Use 1 for one-time total"
          value={data.maxRedemptions}
          onChange={handleChange}
          min="1"
          className="border p-2 rounded"
        />

       

        <label>Start Time</label>
        <input
          type="time"
          name="startTime"
          value={data.startTime}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <label>End Time</label>
        <input
          type="time"
          name="endTime"
          value={data.endTime}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <div className="flex flex-col gap-3 rounded border p-4">
          <label className="font-medium">Available Dates</label>

          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border p-2 rounded flex-1"
            />

            <button
              type="button"
              onClick={addAvailableDate}
              className="bg-emerald-500 px-4 py-2 rounded text-white hover:bg-emerald-600"
            >
              Add Date
            </button>
          </div>

          {data.availableDates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.availableDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => removeAvailableDate(date)}
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
                >
                  {date} ×
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No dates selected yet
            </p>
          )}
        </div>

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
