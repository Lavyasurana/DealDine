import { useContext, useEffect,useState } from "react"
import { rescueContext } from "../context/rescueContext"
import axios from "axios";
import {toast} from 'react-toastify'
import { Restaurant } from "./Restaurant";

export function AllRestaurants(){

    const{backendUrl}=useContext(rescueContext);
    const[admins,setAdmins]=useState([]);
    const getAllAdmins=async()=>{
        try{
        const response=await axios.get(`${backendUrl}/api/admin/getallAdmin`)
        if(response.data.success){
            setAdmins(response.data.admins)
        }
        else{
            toast.error("error loading restraunts.success-flase")

        }
        }catch(error){
            toast.error("error in catch block")
        }
    }

    useEffect(()=>{
        getAllAdmins();
    },[])

    return(
        <div>
            {admins.map((admin,index)=>(
                <Restaurant key={index} admin={admin}/>
            ))}
        </div>
    )
}