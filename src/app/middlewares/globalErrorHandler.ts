import { ErrorRequestHandler } from 'express';
import config from '../config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorMessages: { path: string | number; message: string }[] = [];

    if (err.name === 'ZodError') {
        statusCode = 400;
        message = 'Validation Error';
        errorMessages = err.issues.map((issue: any) => ({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
    } else if (err instanceof Error) {
        message = err.message;
        errorMessages = [
            {
                path: '',
                message: err.message,
            },
        ];
    } else if (err && typeof err === 'object' && 'status' in err) {
        statusCode = (err as any).status;
        message = (err as any).message || message;
        errorMessages = [
            {
                path: '',
                message: message,
            }
        ]
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessages,
        stack: config.env === 'development' ? err?.stack : undefined,
    });
};

export default globalErrorHandler;
