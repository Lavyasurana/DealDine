import express from 'express'
import { addDeal, getAlldeal,listAdminCoupons ,searchRestaurantDeals } from '../controllers/dealController.js'

import { authMiddleware } from '../middleware/authmiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { csrfMiddleware } from '../middleware/csrfMiddleware.js'
const dealRouter=express.Router()

dealRouter.post("/addDeal",authMiddleware,adminMiddleware,csrfMiddleware,addDeal)
dealRouter.get("/getall",getAlldeal)
dealRouter.get("/admin-coupons",authMiddleware,adminMiddleware,listAdminCoupons)
dealRouter.get("/search",searchRestaurantDeals)


export default dealRouter;
