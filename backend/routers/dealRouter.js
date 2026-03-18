import express from 'express'
import { addDeal, getAlldeal,listAdminCoupons ,searchRestaurantDeals } from '../controllers/dealController.js'

import { authMiddleware } from '../middleware/authmiddleware.js'
const dealRouter=express.Router()

dealRouter.post("/addDeal",authMiddleware,addDeal)
dealRouter.get("/getall",getAlldeal)
dealRouter.get("/admin-coupons",authMiddleware,listAdminCoupons)
dealRouter.get("/search",searchRestaurantDeals)


export default dealRouter;