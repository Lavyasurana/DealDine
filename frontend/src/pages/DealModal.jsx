import { useParams } from "react-router-dom";
import { Clock, ChevronDown } from "lucide-react";
import { useEffect } from "react";

import { useContext, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import DiscountCard from "../components/DiscountCard";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios'

export function DealModal() {
  const { dealId } = useParams();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [dealId]);
  const { liveDeals, backendUrl,navigate } = useContext(rescueContext);
  const [open, setOpen] = useState(false);
  const deal = liveDeals.find(d => d._id === dealId);

  if (!deal) {
    return <div className="p-6 text-center">Deal not found.</div>;
  }

  const upcomingDeals = liveDeals.filter(
    d => d.resName === deal.resName && d._id !== deal._id
  );


  const onSubmitHandler = async () => {
    try {

      const response = await axios.post(`${backendUrl}/api/deals/addDeal`, { dealId })
      if (response.data.success)
        toast.success(response.data.message)
      else
        toast.error(response.data.message)
    } catch (error) {
      console.log(error)
    }

  }


  const amount = deal.price* 100;
  const currency = "INR";
  const receiptId = "qwsaq1";

  const paymentHandler = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        toast.error("Please login first");
        return navigate("/login");
      }
  
      // ✅ Create Order
      const { data: order } = await axios.post(
        `${backendUrl}/payment/order`,
        {
          amount,
          currency,
          receipt: receiptId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const options = {
        key: "rzp_test_SMSjR7h5ZhWjTw",
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Rescue",
        description: "Test Transaction",
  
        handler: async function (response) {
          try {
            // ✅ Validate Payment
            const { data: validateRes } = await axios.post(
              `${backendUrl}/payment/validate`,
              response,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            if (validateRes.success) {
               // ✅ Create Coupon
  const { data: couponRes } = await axios.post(
    `${backendUrl}/coupon/create`,
    { dealId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (couponRes.success) {
    toast.success("Payment Successful 🎉");

    // 🔥 Navigate to coupon page
    navigate(`/coupon/${couponRes.coupon._id}`);
  } else {
    toast.error("Failed to create coupon");
  }

            } else {
              toast.error("Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Validation failed");
          }
        },
  
        prefill: {
          name: "Web Dev Matrix",
          email: "webdevmatrix@example.com",
          contact: "9000000000",
        },
  
        theme: {
          color: "#3399cc",
        },
      };
  
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
  
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* LEFT SIDE - Current Deal */}
        <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={deal.image}
            alt={deal.resName}
            className="w-full h-64 object-cover"
          />

          <div className="p-6 space-y-3">
            <h1 className="text-3xl font-bold">{deal.resName}</h1>

            <p className="text-green-600 font-semibold text-lg">
              {deal.dealName}
            </p>
            <p>
              Valid On - {new Date(deal.validFrom).toLocaleDateString("en-IN")}
            </p>

            <div className="flex items-center gap-2 ">
              <Clock className="w-4 h-4" />
              <p>
                {new Date(deal.validFrom).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - {new Date(deal.validTill).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <p className="text-sm text-gray-500">{deal.location}</p>

            <div className="flex justify-between items-center pt-4">
              <span className="text-2xl font-bold">₹{deal.price}</span>
              <button onClick={paymentHandler} className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition">
                Grab Deal
              </button>
            </div>
          </div>
          <div className="border-t mt-6 pt-4">

            {/* Header Row */}
            <div
              className="flex items-center justify-between cursor-pointer lg:cursor-default"
              onClick={() => setOpen(!open)}
            >
              <p className="font-semibold text-gray-800">
                Terms and Conditions
              </p>

              {/* Arrow only on small screens */}
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 lg:hidden ${open ? "rotate-180" : ""
                  }`}
              />
            </div>

            {/* Content */}
            <div
              className={`mt-3 text-sm text-gray-600 
    ${open ? "block" : "hidden"} 
    lg:block`}
            >
              <ul className="list-disc pl-5 space-y-1">
                <li>Valid only on selected menu items.</li>
                <li>Cannot be combined with other offers.</li>
                <li>Offer valid for dine-in only.</li>
                <li>Restaurant reserves the right to cancel anytime.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE - Upcoming Deals */}
        {upcomingDeals.length > 0 && (
          <div className="lg:w-1/3">
            <h2 className="text-2xl font-bold mb-4">
              Upcoming Deals
            </h2>

            <div className="space-y-4">
              {upcomingDeals.map(d => (
                <DiscountCard key={d._id} name={d.resName} offer={d.dealName} validFrom={d.validFrom} validTill={d.validTill} image={d.image} price={deal.price} dealId={d._id} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}