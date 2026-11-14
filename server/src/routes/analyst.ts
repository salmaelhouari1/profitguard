import { Router } from 'express';
import { z } from 'zod';
import { serverDb } from '../db/store.js';
import { authMiddleware, requireWorkspaceAccess } from '../middleware/auth.js';
import { AnalystService } from '../../../src/backend/modules/analyst/analystService.js';
import { AuditService } from '../../../src/backend/modules/audit/auditService.js';

export const analystRouter = Router();

analystRouter.use(authMiddleware);
analystRouter.use(requireWorkspaceAccess);

const querySchema = z.object({
  question: z.string().min(1, 'Question cannot be empty'),
  workspaceId: z.string().optional(),
});

// POST /api/analyst/query
analystRouter.post('/query', (req, res) => {
  try {
    const { question, workspaceId } = querySchema.parse(req.body);
    const wsId = workspaceId || req.user!.workspaceId;

    // Use grounded analytical engine
    const answer = AnalystService.query({
      workspaceId: wsId,
      role: req.user!.role,
      question,
      userId: req.user!.userId,
    });

    res.json(answer);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Analyst query failed' });
  }
});
