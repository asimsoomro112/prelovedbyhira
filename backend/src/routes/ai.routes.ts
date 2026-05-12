import { Router } from 'express';
import { AIService } from '../services/ai.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// Neural Chat Endpoint
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const response = await AIService.getChatResponse(message, history || []);
    res.json({ response });
  } catch (error) {
    next(error);
  }
});

export default router;
