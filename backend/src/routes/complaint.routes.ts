import {Router} from 'express';
import type { Express } from 'express';
import { createComplaint, getComplaint, getComplaints, deleteComplaint, updateComplaint, getUserComplaints } from '../controllers/complaint.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const app: Express = router as any;
app.use(authMiddleware)

router.post('/new', createComplaint);

router.get('/', getComplaints);
router.get('/my-complaints', getUserComplaints);
router.route('/:id').get(getComplaint).put(updateComplaint).delete(deleteComplaint);
export default router;