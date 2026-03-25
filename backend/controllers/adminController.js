import adminModel from "../models/adminModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const createToken = (admin)=>{
  return jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  )
}

/* REGISTER ADMIN */

export const registerAdmin = async(req,res)=>{
  try{
    const {name,email,password,restaurantName} = req.body
    const allowed = await allowedModel.findOne({ email });

    if (!allowed) {
      return res.json({
        success: false,
        message: "You are not authorized to register"
      });
    }

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
      restaurantName,
      password:hashedPassword,
     
    })

    await admin.save()

   

    res.json({
      success:true,
     
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
        message:"email or password wrong"
      })
    }

    const isMatch = await bcrypt.compare(password,admin.password)

    if(!isMatch){
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
      return res.json({
        success:false,
        message:"email or password wrong"
      })
    }

    admin.lastLogin = new Date()
    await admin.save()

    const token = createToken(admin)

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


import cloudinary from "../config/cloudinary.js";
import allowedAdminModel from "../models/allowedAdminModel.js"
import allowedModel from "../models/allowedAdminModel.js"

export const adminProfile = async (req, res) => {
  try {
    const { restaurantName, location, town } = req.body;
    const userId = req.user.id;

    let imageUrl = "";

    // upload image only if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      {
        restaurantName,
        location,
        town,
        ...(imageUrl && { imageUrl }) // update image only if exists
      },
      { new: true } // returns updated doc
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};

export const getAllAdmin=async(req,res)=>{
  try{
    const admins = await adminModel.find({})
    .select("-name -email -password -createdAt -lastLogin");
  console.log(admins)
  if(admins){
    res.json({success:true,admins:admins})
  }

  }catch(error){
    res.json({success:false,error})
  }


}


