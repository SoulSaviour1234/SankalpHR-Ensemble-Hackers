import { Router } from 'express';
import authRoutes from './authRoutes';
import employeeRoutes from './employeeRoutes';
import attendanceRoutes from './attendanceRoutes';
import timeOffRoutes from './timeOffRoutes';
import chatRoutes from './chatRoutes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/time-off', timeOffRoutes);
apiRouter.use('/chat', chatRoutes);

export default apiRouter;
