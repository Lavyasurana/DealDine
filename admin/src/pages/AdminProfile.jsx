export function AdminProfile(){

    

    return(
    <div>
        <input
          type="text"
          name="restaurantName"
          placeholder="Restaurant Name"
          value={data.resName}
          
          required
          className="border p-2 rounded"
        />

    </div>
    )
}