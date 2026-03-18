import userModel from "../models/userModel.js";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const createToken=async(id)=>{
    const token= jwt.sign({id},process.env.JWT_SECRET_KEY, { expiresIn: "1d" })
    return token;

}
const userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user= await userModel.findOne({email})
        if(!user)
            return res.json({success:false,message:"User does not exist"})
    
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)
            return res.json({success:false,message:"Enter valid password"})
    
        const token=await createToken(user._id)
        res.json({success:true,token,user_name:user.name,user_id:user._id})
        console.log("token:",token)
    
    
    
    
    
    }catch(error){
        console.log(error.message)
        res.json({success:false,error})
        }
}

const userRegister=async(req,res)=>{
    try{
        
        const{firstName,lastName,email,password,phone,userId}=req.body;
     
       
        if(!validator.isEmail(email))
            return res.json({success:false,message:"enter a valid email"})
        const exist=await userModel.findOne({email});
        if(exist)
            return res.json({success:false,message:"user already exists"})
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);
        
        const user= new userModel({
            firstName,lastName,phone,email,password:hashedPassword,userId
        })
    
       
        await user.save();
        res.json({success:true,userId:user._id})
   
        
    }catch(error){
        console.log(error)
        res.json({success:false,error})
    }
}

const getCurrentUser = async (req, res) => {
    try {
      const user = await userModel
        .findById(req.user.id)
        .select("-password");
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.json({
        success: true,
        user
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

export {userLogin,userRegister,getCurrentUser}