import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  restaurantName: {
    type: String,
    required: true
  },

  phone: {
    type: String
  },

  location: {
    type: String
  },

  town: {
    type: String
  },

  imageUrl:{
    type:String,required:false
  },



  

  createdAt: {
    type: Date,
    default: Date.now
  },

  lastLogin: {
    type: Date
  }

});

const adminModel = mongoose.model("Admin", adminSchema);

export default adminModel;