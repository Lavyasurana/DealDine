import { useContext, useEffect, useState } from "react";
import { rescueContext } from "../context/rescueContext";
import axios from 'axios'
import { toast } from 'react-toastify';
import { Link, useSearchParams } from "react-router-dom";

const SIGNUP_OTP_STORAGE_KEY = "pendingSignupOtp";

export function Login() {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [currentState, setCurrentState] = useState('Sign Up')
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [offerCode, setOfferCode] = useState('');
    const [searchParams] = useSearchParams();

    const { backendUrl, navigate, setUserLogin,getUser } = useContext(rescueContext);

    const persistPendingSignup = (signupEmail, signupOfferCode) => {
        sessionStorage.setItem(
            SIGNUP_OTP_STORAGE_KEY,
            JSON.stringify({
                email: signupEmail,
                offerCode: signupOfferCode || '',
                expiresAt: Date.now() + 10 * 60 * 1000,
            })
        );
    };

    const clearPendingSignup = () => {
        sessionStorage.removeItem(SIGNUP_OTP_STORAGE_KEY);
    };

    const switchToLogin = () => {
        setCurrentState('Login');
        setShowOtpStep(false);
        setOtp('');
        setResendCooldown(0);
        clearPendingSignup();
    };

    const resetSignupForm = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setUserId('');
        setPassword('');
        setConfirmPassword('');
        setAgreeTerms(false);
        setOtp('');
        setShowOtpStep(false);
        setResendCooldown(0);
        clearPendingSignup();
    };

    const completeLogin = async (couponId) => {
        setUserLogin(true);
        await getUser();
        navigate(couponId ? `/coupon/${couponId}` : "/");
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
    };

    const resendOtp = async () => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/user/resend-otp`,
                { email }
            );

            if (response.data.success) {
                toast.success("A new OTP has been sent");
                startResendCooldown();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        }
    };

    const onResendClick = async () => {
        if (resendCooldown > 0) return;
        await resendOtp();
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
    
        try {
            if (currentState === 'Sign Up') {
                if (showOtpStep) {
                    const response = await axios.post(
                        `${backendUrl}/api/user/verify-otp`,
                        { email, otp }
                    );

                    if (response.data.success) {
                        await completeLogin(response.data.coupon?._id);
                        toast.success(response.data.coupon ? "Account created and coupon issued" : "Account created successfully");
                        resetSignupForm();
                    } else {
                        toast.error(response.data.message);
                    }

                    return;
                }
    
                if (password !== confirmPassword) {
                    return toast.error("Passwords do not match");
                }

                if (!agreeTerms) {
                    return toast.error("Please accept the Terms & Conditions");
                }
    
                const response = await axios.post(
                    `${backendUrl}/api/user/register`,
                    { firstName, lastName, email, password, phone, userId, offer: offerCode }
                );
    
                if (response.data.success) {
                    toast.success("Check your email for the OTP 📩")
                    setOtp('');
                    setShowOtpStep(true);
                    startResendCooldown();
                    persistPendingSignup(email, offerCode);
                }
                else{
                    toast.error(response.data.message)
                }
    
            } else {
    
                const response = await axios.post(
                    `${backendUrl}/api/user/login`,
                    { email, password }
                );
    
                if (response.data.success) {
    
                    await completeLogin();
    
                    toast.success("Successfully logged in");
                } else {
                    toast.error(response.data.message);
                    setEmail('')
                    setPassword('')
                }
            }
    
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || "Something went wrong"
            );
        }
    };

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((current) => {
                if (current <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    useEffect(() => {
        const rawPendingSignup = sessionStorage.getItem(SIGNUP_OTP_STORAGE_KEY);

        if (!rawPendingSignup) {
            return;
        }

        try {
            const pendingSignup = JSON.parse(rawPendingSignup);

            if (!pendingSignup.email || !pendingSignup.expiresAt) {
                clearPendingSignup();
                return;
            }

            if (pendingSignup.expiresAt <= Date.now()) {
                clearPendingSignup();
                return;
            }

            setEmail(pendingSignup.email);
            setOfferCode(pendingSignup.offerCode || '');
            setCurrentState("Sign Up");
            setShowOtpStep(true);

            const secondsLeft = Math.max(
                0,
                Math.ceil((pendingSignup.expiresAt - Date.now()) / 1000)
            );
            setResendCooldown(Math.min(secondsLeft, 60));
        } catch (error) {
            clearPendingSignup();
        }
    }, []);

    useEffect(() => {
        const offerFromUrl = searchParams.get("offer");

        if (!offerFromUrl) {
            return;
        }

        setOfferCode(offerFromUrl.trim().toUpperCase());
        setCurrentState("Sign Up");
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">{
            currentState === 'Sign Up' ?
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px] bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
                    <h1 className='text-2xl font-bold items-center text-emerald-700'>
                        {showOtpStep ? 'Verify your email' : 'Create your account'}
                    </h1>

                    {showOtpStep ? (
                        <>
                            <p className="text-sm text-gray-600">
                                Enter the 6-digit OTP sent to {email}.
                            </p>
                            <input
                                required
                                onChange={(e) => setOtp(e.target.value)}
                                value={otp}
                                className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder='Enter OTP'
                            />
                            <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>
                                Verify OTP
                            </button>
                            <div className="flex justify-between text-sm">
                                <p
                                    onClick={onResendClick}
                                    className={`cursor-pointer ${resendCooldown > 0 ? "text-gray-400" : "text-emerald-600"}`}
                                >
                                    {resendCooldown > 0
                                        ? `Resend OTP in ${resendCooldown}s`
                                        : "Resend OTP"}
                                </p>
                                <p
                                    onClick={() => setShowOtpStep(false)}
                                    className='cursor-pointer text-emerald-600'
                                >
                                    Edit signup details
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='flex gap-3'>
                                <input required onChange={(e) => setFirstName(e.target.value)} name='firstName' value={firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                                <input required onChange={(e) => { setLastName(e.target.value) }} name='lastName' value={lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                            </div>
                            <input required onChange={(e) => setUserId(e.target.value)} name='userId' value={userId} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='User Id' />
                            <input required onChange={(e) => { setEmail(e.target.value) }} name='email' value={email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                            <input required onChange={(e) => { setPhone(e.target.value) }} name='phone' value={phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
                            <input required onChange={(e) => { setPassword(e.target.value) }} name='password' value={password} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Password' />
                            <input required onChange={(e) => { setConfirmPassword(e.target.value) }} name='confirmPassword' value={confirmPassword} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Confirm Password' />
                            {offerCode ? (
                                <div className="rounded border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700">
                                    Signup offer applied: {offerCode}
                                </div>
                            ) : null}
                            <div className="flex items-center gap-2 text-sm mt-2">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <p>
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-emerald-600 underline">
                                        Terms & Conditions
                                    </Link>
                                </p>
                            </div>
                            <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>Register</button>
                        </>
                    )}
                    <div className='w-full flex justify-between text-sm mt-[-8px]'>
                    <p onClick={switchToLogin} className=' cursor-pointer text-emerald-600'>Login Here</p>

                </div>


                </div> :
                <div className='flex flex-col gap-4 w-full sm:max-w-[480px] bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300'>
                    <h1 className='text-2xl font-bold text-emerald-700'>Welcome back</h1>
                    <input required onChange={(e) => setEmail(e.target.value)} name='email' value={email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                    <input required onChange={(e) => { setPassword(e.target.value) }} name='password' value={password} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="password" placeholder='Password' />
                    <div className='w-full flex justify-between text-sm mt-[-8px]'>
                        <Link to="/forgot-password"className=' cursor-pointer'>Forgot your password?</Link>

                        <p onClick={() => setCurrentState('Sign Up')} className=' cursor-pointer'>Create account</p>

                    </div>
                    <button onClick={onSubmitHandler} className='bg-black text-white font-light px-8 py-2 mt-4 bg-emerald-600'>Login</button>
                </div>
        }
        </div>

    )
}
