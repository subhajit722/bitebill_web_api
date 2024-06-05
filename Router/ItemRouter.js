import express from 'express';
import { PostItem, GetItem, EditItem, DeleteItem } from '../Contex/ItemContex.js';
import auth from '../Middelware/authMiddelware.js'

const router = express.Router();

// Route for posting an item
router.post('/items', auth, PostItem);

// Route for getting all items
router.get('/items', auth, GetItem);

// Route for editing an item
router.put('/items/:id', auth, EditItem);

// Route for deleting an item
router.delete('/items/:id', auth, DeleteItem);

export default router;
