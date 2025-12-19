import {Router} from 'express';
import { createServiceType, getServiceTypes, getServiceType, deleteServiceType, updateServiceType } from '../controllers/serviceType.controllers.js';

const router = Router();
router.post('/new', createServiceType);

router.get('/', getServiceTypes);
router.route('/:id').get(getServiceType).put(updateServiceType).delete(deleteServiceType);
export default router;