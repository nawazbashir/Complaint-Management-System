import {Router} from 'express';
import { createUser, deleteUser, getAllUsers, getUserById, login, logout, refresh, updateUser } from '../controllers/user.controllers.js';

const router = Router();
router.post('/new', createUser);
router.get('/', getAllUsers)
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);
router.post('/login', login);
router.post('/logout', logout);
router.route('/refresh').get(refresh);
export default router;