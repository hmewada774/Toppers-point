

import express from "express";
import Topper from "../models/Topper.js";

const router = express.Router();

router.get('/', async (req, res) => {
  try{
    const toppers = await Topper.find().sort({ year: -1 });
    res.json(toppers);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch toppers' });
  }
});

export default router;

