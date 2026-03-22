import { useState } from "react";
import axios from "axios";
import upload_area from '../assets/upload_area.png'


import { useContext } from "react";
import { adminContext } from "../context/adminContext";
import { ToastContainer, toast } from 'react-toastify';
export function Profile() {

    const [restaurantName, setResName] = useState('');
    const [location, setLocation] = useState('');
    const [town, setTown] = useState('');
    const [image, setImage] = useState(false);

    const{backendUrl}=useContext(adminContext);

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('restaurantName', restaurantName);
            formData.append('location', location);
            formData.append('town', town);
            formData.append('image', image);

            const result = await axios.post(
                backendUrl + "/api/admin/profile",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            );
            console.log("admin profile success")
            toast.success("Saved Successfully")
            alert("successfully edited profile")


           

            // reset
            setResName('');
            setLocation('');
            setTown('');
            setImage(false);

        } catch (error) {
            console.log(error);
            toast.error("error in saving")
           
        }
    };

    return (
        <div>
            <form onSubmit={onSubmitHandler} className="flex flex-col gap-5 p-5">

                <div>
                    <p className="font-semibold">Restaurant Name</p>
                    <input
                        value={restaurantName}
                        onChange={(e) => setResName(e.target.value)}
                        type="text"
                        placeholder="Restaurant Name"
                        required
                        className="border p-2 rounded"
                    />
                </div>

                <div>
                    <p className="font-semibold">Location</p>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        type="text"
                        placeholder="Location"
                        required
                        className="border p-2 rounded"
                    />
                </div>

                <div>
                    <p className="font-semibold">Town</p>
                    <input
                        value={town}
                        onChange={(e) => setTown(e.target.value)}
                        type="text"
                        placeholder="Town"
                        required
                        className="border p-2 rounded"
                    />
                </div>

                <div>
                    <p className="font-semibold">Restaurant Image</p>
                    <label>
                        <img
                            className="w-24 cursor-pointer"
                            src={!image ? upload_area : URL.createObjectURL(image)}
                            alt=""
                        />
                        <input
                            type="file"
                            hidden
                            required
                            onChange={(e) => setImage(e.target.files[0])}
                        />
                    </label>
                </div>

                <button className="bg-black text-white px-4 py-2 rounded w-32">
                    Save
                </button>

            </form>
        </div>
    );
}