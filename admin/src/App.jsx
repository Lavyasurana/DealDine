import { useState } from 'react'
import{Route,Routes} from 'react-router-dom'
import { Home } from './pages/Home'
import Sidebar from './components/Sidebar'
import  AddCoupon  from './pages/AddCoupon'
import RedeemCoupon from './pages/ReedemCoupons'
import ListCoupons from './pages/ListCoupon'
import { UserCoupons } from './pages/UserCoupons'
import Navbar from './components/Navbar'
import Login from './pages/Login'


function App() {

  return (
    <div>
      <Navbar/>
   <div className='flex w-full'>
    <Sidebar/>
    <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/add-coupon" element={<AddCoupon/>}/>
      <Route path="/redeem-coupon" element={<RedeemCoupon/>}/>
      <Route path="/list-coupons" element={<ListCoupons/>}/>
      <Route path="/user-coupons" element={<UserCoupons/>}/>
      <Route path="/login" element={<Login/>}/>
      

    </Routes>
    </div>
   </div>
   </div>
  )
}

export default App
