import { Router } from "express";
import handlers from "../handlers";

import { validate } from '../auth/jwt';

const router = Router();

// Order Matters
router.use(validate);

router.get('/listings/search', handlers.listingsQuery);
