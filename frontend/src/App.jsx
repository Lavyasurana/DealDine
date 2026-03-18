import { useState } from 'react'

import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

import Navbar from './components/Navbar'
import { DealModal } from './pages/DealModal'
import {Login} from './pages/Login'
import { Upcoming } from './pages/Upcoming'
import { Contact } from './pages/Contact'
import { ToastContainer,Bounce} from 'react-toastify';

import { CouponPage } from './pages/stamp'
import { Profile } from './pages/Profile'
import Search from './pages/Search'
function App() {


  return (
    <>
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
     
        <Navbar /> 
        <div className='pt-20'>
        <Routes>
          <Route path="/" element={<Home/>} />
          
          <Route path="/getDeals/:dealId" element={<DealModal/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/upcoming" element={<Upcoming/>} />
          <Route path="/contact" element={<Contact/>} />
          
          <Route path="/coupon/:couponId" element={<CouponPage />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path='/search' element={<Search/>}/>
            </Routes>
        </div>
      

</>
  )
}

export default App
