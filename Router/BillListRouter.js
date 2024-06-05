import express from 'express';
import { postBillList, getBillList } from '../Contex/BillListContex.js';
import auth from '../Middelware/authMiddelware.js'
const router = express.Router();

// Route for posting a bill list
router.post('/bill-list', auth,  postBillList);

// Route for getting bill list
router.get('/bill-list/:billNoId', auth, getBillList);

export default router;
