import dealModel from "../models/dealModel.js"
import userModel from "../models/userModel.js"


import { sendDealEmail } from "../services/emailService.js"

const addDeal = async(req,res)=>{
  try{

    const adminId = req.user.id

    const deal = new dealModel({
      ...req.body,
      admin:adminId
    })

    await deal.save()

    /* FETCH USERS */
    const users = await userModel.find()

    /* SEND EMAIL TO EACH USER */

    for(let user of users){
      await sendDealEmail(user.email, deal)
    }

    res.json({
      success:true,
      message:"Deal Added & Users Notified"
    })

  }catch(error){
    console.log(error)

    res.json({
      success:false,
      message:"Error adding deal"
    })
  }
}



   const getAlldeal = async (req, res) => {
    try {
  
      const today = new Date()
  
      const startOfDay = new Date(today.setHours(0,0,0,0))
      const endOfDay = new Date(today.setHours(23,59,59,999))
  
      const deals = await dealModel.find({})
  
      res.json({
        success: true,
        deals
      })
  
    } catch (error) {
  
      console.log(error)
  
      res.json({
        success: false,
        message: "Failed to fetch deals"
      })
  
    }
  }

   const listAdminCoupons = async(req,res)=>{
    try{
  
      const adminId = req.user.id
  
      const deals = await dealModel.find({admin:adminId})
        .sort({createdAt:-1})
  
      res.json({
        success:true,
        deals
      })
  
    }catch(error){
  
      console.log(error)
  
      res.json({
        success:false,
        message:"Failed to fetch coupons"
      })
  
    }
  }

  export const searchRestaurantDeals = async (req,res)=>{
    try{
  
      const {query} = req.query
  
      const deals = await dealModel.find({
        resName: { $regex: query, $options: "i" }
      }).sort({createdAt:-1})
  
      res.json({
        success:true,
        deals
      })
  
    }catch(error){
  
      console.log(error)
  
      res.json({
        success:false,
        message:"Search failed"
      })
  
    }
  }



export {addDeal,getAlldeal,listAdminCoupons}