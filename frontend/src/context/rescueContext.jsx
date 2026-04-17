import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const rescueContext = createContext();


const RescueProvider = (props) => {

    const backendUrl =import.meta.env.VITE_backend_Url;
    const [userLogin, setUserLogin] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const navigate = useNavigate();
    const[liveDeals,setLiveDeals]=useState([])
    const [user, setUser] = useState(null);

    const clearAuthState = () => {
      setUserLogin(false);
      setUser(null);
    };

    useEffect(() => {
      const initAuth = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/user/me`, { withCredentials: true });
    
          if (res.data.success) {
            setUser(res.data.user);
            setUserLogin(true);
          } else {
            clearAuthState();
          }
    
        } catch (err) {
          clearAuthState();
        } finally {
          setAuthReady(true);
        }
      };
    
      initAuth();
    }, [backendUrl]);

    const logout = async () => {
        try {
          await axios.post(`${backendUrl}/api/user/logout`, {}, { withCredentials: true });
        } catch (_error) {
          // Client state is cleared even if logout request fails.
        }
        clearAuthState();
        navigate("/");
    };

    const getAllDeals=async()=>{
        const response=await axios.get(`${backendUrl}/api/deals/getall`)
        if(response.data.success){
            
            setLiveDeals(response.data.deals)
            console.log("added successfully livedeals")
        }
    
    else
        console.log("error in adding livedeals")
    }

    useEffect(()=>{
        getAllDeals();
    },[])

    const getUser = async () => {
        try {
          const res = await axios.get(`${backendUrl}/api/user/me`, { withCredentials: true });
      
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.log("Failed to fetch user");
        }
      };

    const value = {
        liveDeals,
        backendUrl,
        navigate,
        userLogin,
        authReady,
        setUserLogin,
        logout,
        userCredits: user?.credits || 0 ,
        setUser  ,
        getUser,
        clearAuthState
    };



    return (
        <rescueContext.Provider value={value}>
            {props.children}
        </rescueContext.Provider>
    );
};

export default RescueProvider;
