import express from 'express';
import * as Controller from '../controllers';
import * as Validation from '../validation';

const router = express.Router();

// Add event reminder
router.post(
  '/add',
  Validation.validateSetReminder,
  Controller.setReminder,
);

export default router;