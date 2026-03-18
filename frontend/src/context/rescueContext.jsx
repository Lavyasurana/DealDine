import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const rescueContext = createContext();


const RescueProvider = (props) => {

    const backendUrl =import.meta.env.VITE_backend_Url;
    const [userLogin, setUserLogin] = useState(false);
    const navigate = useNavigate();
    const[liveDeals,setLiveDeals]=useState([])

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

    const value = {
        liveDeals,
        backendUrl,
        navigate,
        userLogin,
        setUserLogin,
        logout
    };

    return (
        <rescueContext.Provider value={value}>
            {props.children}
        </rescueContext.Provider>
    );
};

export default RescueProvider;