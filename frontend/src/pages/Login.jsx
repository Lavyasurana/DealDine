import { useContext, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';

export function Login() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currentState, setCurrentState] = useState('Sign Up')

    const { backendUrl, navigate, setUserLogin } = useContext(rescueContext);
    const onSubmitHandler = async (event) => {
        event.preventDefault();
    
        try {
            if (currentState === 'Sign Up') {
    
                if (password !== confirmPassword) {
                    return toast.error("Passwords do not match");
                }
    
                const response = await axios.post(
                    `${backendUrl}/api/user/register`,
                    { firstName, lastName, email, password, phone, userId }
                );
    
                if (response.data.success) {
                    toast.success("Registration successful");
                    setCurrentState("Login");
                }
    
            } else {
    
                const response = await axios.post(
                    `${backendUrl}/api/user/login`,
                    { email, password }
                );
    
                if (response.data.success) {
    
                    const token = response.data.token;
    
                    localStorage.setItem("token", token);
                    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
                    setUserLogin(true);
    
                    toast.success("Successfully logged in");
    
                    navigate("/");
                } else {
                    toast.error(response.data.message);
                }
            }
    
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">{
            currentState === 'Sign Up' ?
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px] bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
                    <h1 className='text-2xl font-bold items-center text-emerald-700'>Create your account</h1>
                    <div className='flex gap-3'>
                        <input required onChange={(e) => setFirstName(e.target.value)} name='firstName' value={firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                        <input required onChange={(e) => { setLastName(e.target.value) }} name='lastName' value={lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                    </div>
                    <input required onChange={(e) => setUserId(e.target.value)} name='userId' value={userId} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='User Id' />


                    <input required onChange={(e) => { setEmail(e.target.value) }} name='email' value={email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />

                    <input required onChange={(e) => { setPhone(e.target.value) }} name='phone' value={phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
                    <input required onChange={(e) => { setPassword(e.target.value) }} name='password' value={password} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Password' />
                    <input required onChange={(e) => { setConfirmPassword(e.target.value) }} name='confirmPassword' value={confirmPassword} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Confirm Password' />
                    <div className='w-full flex justify-between text-sm mt-[-8px]'>
                        <p className=' cursor-pointer'>Forgot your password?</p>

                        <p onClick={() => setCurrentState('Login')} className=' cursor-pointer'>Login Here</p>

                    </div>
                    <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>Register</button>


                </div> :
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px] bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
                    <h1 className='text-2xl font-bold text-emerald-700'>Welcome back</h1>
                    <input required onChange={(e) => setEmail(e.target.value)} name='email' value={email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                    <input required onChange={(e) => { setPassword(e.target.value) }} name='password' value={password} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Password' />
                    <div className='w-full flex justify-between text-sm mt-[-8px]'>
                        <p className=' cursor-pointer'>Forgot your password?</p>

                        <p onClick={() => setCurrentState('Sign Up')} className=' cursor-pointer'>Create account</p>

                    </div>
                    <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>Login</button>
                </div>
        }
        </div>

    )
}