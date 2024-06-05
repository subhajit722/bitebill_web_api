import express from 'express';
import { postBill, getBill , getLastBill } from '../Contex/BillContex.js';
import auth from '../Middelware/authMiddelware.js'
const router = express.Router();

// Route for generating a bill
router.post('/postbill', auth, postBill);

// Route for getting bills
router.get('/bills', auth, getBill);
router.get('/lastbill', auth, getLastBill)

export default router;
