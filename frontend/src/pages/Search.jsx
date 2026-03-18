import React, { useState, useEffect } from "react"
import axios from "axios"
import { UpcomingDealTemplate } from "../components/UpcomingDealTemplate"

const Search = () => {

  const [query,setQuery] = useState("")
  const [results,setResults] = useState([])

  const backendUrl = "http://localhost:5111"

  useEffect(()=>{

    const fetchResults = async()=>{

      if(query.length < 1){
        setResults([])
        return
      }

      try{

        const res = await axios.get(
          `${backendUrl}/api/deals/search?query=${query}`
        )

        if(res.data.success){
          setResults(res.data.deals)
        }

      }catch(error){
        console.log(error)
      }

    }

    const timer = setTimeout(fetchResults,400)

    return ()=> clearTimeout(timer)

  },[query])

  return (
    <div className="w-full max-w-[900px] mx-auto mt-10">

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search restaurants..."
        value={query}
        onChange={(e)=>setQuery(e.target.value)}
        className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      {/* Results */}
      <div className="mt-6 grid gap-4">

        {results.map((deal)=>(
          <div>
            <UpcomingDealTemplate deal={deal}/>
       

          </div>
        ))}

      </div>

    </div>
  )
}

export default Search