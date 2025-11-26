import {Router} from 'express';
import { createIssue } from '../controllers/issue.controllers.js';

const router = Router();
router.post('/new', createIssue);
// router.get('/', getIssues);
// router.get('/:id', getIssueById);
// router.put('/:id', updateIssue);
// router.delete('/:id', deleteIssue);
export default router;