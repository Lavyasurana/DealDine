import express from 'express'
import { getOrder, payWithCredits, validateOrder } from '../controllers/razorpayController.js'
import { authMiddleware } from '../middleware/authmiddleware.js'

const payRouter=express.Router()

payRouter.post('/order',authMiddleware,getOrder)
payRouter.post('/validate',authMiddleware,validateOrder)
payRouter.post('/pay-with-credits',authMiddleware,payWithCredits)

export default payRouter;