import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const rescueContext = createContext();


const RescueProvider = (props) => {

    const backendUrl =import.meta.env.VITE_backend_Url;
    const [userLogin, setUserLogin] = useState(false);
    const navigate = useNavigate();
    const[liveDeals,setLiveDeals]=useState([])
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setUserLogin(true);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUserLogin(false);
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
          const res = await axios.get(`${backendUrl}/api/user/me`);
      
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.log("Failed to fetch user");
        }
      };

      useEffect(() => {
        const token = localStorage.getItem("token");
      
        if (token) {
          setUserLogin(true);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
          getUser();
        }
      }, []);

    const value = {
        liveDeals,
        backendUrl,
        navigate,
        userLogin,
        setUserLogin,
        logout,
        userCredits: user?.credits || 0   
    };



    return (
        <rescueContext.Provider value={value}>
            {props.children}
        </rescueContext.Provider>
    );
};

export default RescueProvider;