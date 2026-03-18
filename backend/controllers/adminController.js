import adminModel from "../models/adminModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createToken = (id)=>{
  return jwt.sign({id},process.env.JWT_SECRET_KEY)
}

/* REGISTER ADMIN */

export const registerAdmin = async(req,res)=>{
  try{

    const {name,email,password,restaurantName,phone,location,town} = req.body

    const existing = await adminModel.findOne({email})

    if(existing){
      return res.json({
        success:false,
        message:"Admin already exists"
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)

    const admin = new adminModel({
      name,
      email,
      password:hashedPassword,
      restaurantName,
      phone,
      location,
      town
    })

    await admin.save()

    const token = createToken(admin._id)

    res.json({
      success:true,
      token
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Error creating admin"
    })

  }
}


/* LOGIN ADMIN */

export const loginAdmin = async(req,res)=>{
  try{

    const {email,password} = req.body

    const admin = await adminModel.findOne({email})

    if(!admin){
      return res.json({
        success:false,
        message:"Admin not found"
      })
    }

    const isMatch = await bcrypt.compare(password,admin.password)

    if(!isMatch){
      return res.json({
        success:false,
        message:"Invalid credentials"
      })
    }

    admin.lastLogin = new Date()
    await admin.save()

    const token = createToken(admin._id)

    res.json({
      success:true,
      token
    })

  }catch(error){

    console.log(error)

    res.json({
      success:false,
      message:"Login failed"
    })

  }
}