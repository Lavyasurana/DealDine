import { useContext, useState } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import {adminContext} from "../context/adminContext";

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate=useNavigate();

    const{adminLogin,setAdminLogin,backendUrl}=useContext(adminContext);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(
                `${backendUrl}/api/admin/login`,
                { email, password }
            );

            if (response.data.success) {

                const token = response.data.token;

                localStorage.setItem("adminToken", token);
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                setAdminLogin(true)       

                navigate("/");
            } else {
                consol.log(response.data.message)
            }
        } catch (error) {
            console.log(error)
            setEmail('')
            setPassword('')
        }
    }

    return (
        <div className='flex flex-col gap-4 w-full sm:max-w-[480px] bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
            <h1 className='text-2xl font-bold text-emerald-700'>Welcome back</h1>
            <input required onChange={(e) => setEmail(e.target.value)} name='email' value={email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
            <input required onChange={(e) => { setPassword(e.target.value) }} name='password' value={password} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Password' />

            <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>Login</button>
        </div>
    )
}