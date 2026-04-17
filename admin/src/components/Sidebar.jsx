import React from 'react'
import { NavLink } from 'react-router-dom'
import { PlusCircle, Ticket, List, Users } from "lucide-react"

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>

      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>

      <NavLink
          to="/profile"
          className={({isActive}) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-emerald-100 border-emerald-500" : ""
            }`
          }
        >
          <PlusCircle className='w-5 h-5'/>
          <p className='hidden md:block'>Profile</p>
        </NavLink>

        {/* Add Coupon */}
        <NavLink
          to="/add-coupon"
          className={({isActive}) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-emerald-100 border-emerald-500" : ""
            }`
          }
        >
          <PlusCircle className='w-5 h-5'/>
          <p className='hidden md:block'>Add Coupon</p>
        </NavLink>

        {/* Redeem Coupon */}
        <NavLink
          to="/redeem-coupon"
          className={({isActive}) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-emerald-100 border-emerald-500" : ""
            }`
          }
        >
          <Ticket className='w-5 h-5'/>
          <p className='hidden md:block'>Redeem Coupon</p>
        </NavLink>

        {/* List Coupons */}
        <NavLink
          to="/list-coupons"
          className={({isActive}) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-emerald-100 border-emerald-500" : ""
            }`
          }
        >
          <List className='w-5 h-5'/>
          <p className='hidden md:block'>List Coupons</p>
        </NavLink>

        {/* User Coupons */}
        <NavLink
          to="/user-coupons"
          className={({isActive}) =>
            `flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l ${
              isActive ? "bg-emerald-100 border-emerald-500" : ""
            }`
          }
        >
          <Users className='w-5 h-5'/>
          <p className='hidden md:block'>User Coupons</p>
        </NavLink>

      </div>

    </div>
  )
}

export default Sidebar
