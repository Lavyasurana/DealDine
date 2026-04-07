import './App.css'
import { Routes, Route } from 'react-router-dom'
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
import Footer from './components/Footer'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { RefundPolicy } from './pages/Refund'
import { VerifyPayment } from './pages/VerifyPayment'
import { ProtectedRoute } from './ProtectedRoute'
import { CashfreeReturn } from './pages/CashfreeReturn'
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
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
          <Route path='/search' element={<Search/>}/>
          <Route path='/terms' element={<Terms/>}/>
          <Route path="/privacy" element={<Privacy/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path='/reset-password/:token' element={<ResetPassword/>}/>
          <Route path="/refund" element={<RefundPolicy/>}/>
          <Route path="/cashfree-return" element={<CashfreeReturn/>}/>
          <Route path="/verify-payment/:dealId" element={<VerifyPayment/>}/>
          </Routes>
        </div>
        <Footer/>
      

</>
  )
}

export default App
