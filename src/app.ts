import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

// Application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: 'Vehicle Rental System API Running!',
    });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
