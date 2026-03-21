import { useState } from 'react'
import{Route,Routes} from 'react-router-dom'
import { Home } from './pages/Home'
import Sidebar from './components/Sidebar'
import  AddCoupon  from './pages/AddCoupon'
import RedeemCoupon from './pages/ReedemCoupons'
import ListCoupons from './pages/ListCoupon'
import { UserCoupons } from './pages/UserCoupons'
import Navbar from './components/Navbar'
import {Login} from './pages/Login'
import { Profile } from './pages/Profile'
import { ToastContainer,Bounce} from 'react-toastify';
import { ProtectedRoute } from './ProtectedRoute'


function App() {

  return (
    <div>
       <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Navbar/>
   <div className='flex w-full'>
    <Sidebar/>
    <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
    <Routes>
  <Route path="/login" element={<Login />} />

  <Route
    path="/"
    element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    }
  />

  <Route
    path="/add-coupon"
    element={
      <ProtectedRoute>
        <AddCoupon />
      </ProtectedRoute>
    }
  />

  <Route
    path="/redeem-coupon"
    element={
      <ProtectedRoute>
        <RedeemCoupon />
      </ProtectedRoute>
    }
  />

  <Route
    path="/list-coupons"
    element={
      <ProtectedRoute>
        <ListCoupons />
      </ProtectedRoute>
    }
  />

  <Route
    path="/user-coupons"
    element={
      <ProtectedRoute>
        <UserCoupons />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />
</Routes>
    </div>
   </div>
   </div>
  )
}

export default App
