import {Router} from 'express';
import { createRole, getRole, getRoles, deleteRole, updateRole } from '../controllers/role.controllers.js';

const router = Router();
router.post('/new', createRole);

router.get('/', getRoles);
router.route('/:id').get(getRole).put(updateRole).delete(deleteRole);
export default router;