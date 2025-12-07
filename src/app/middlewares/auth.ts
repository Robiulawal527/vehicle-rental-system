import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import prisma from '../utils/prisma';

const auth = (...requiredRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization; // Expecting "Bearer <token>" usually, but simple token is also possible depending on requirement. 
            // The README says: Protected endpoints require token in header: `Authorization: Bearer <token>`

            if (!token) {
                throw new Error('You are not authorized!');
            }

            let verifiedToken;
            try {
                // If the token usually comes as "Bearer <token>", let's assume the user sends it correctly or handle splitting.
                // However, standard jwt libraries might just parse the string. 
                // Let's handle "Bearer " prefix if present.
                const tokenToVerify = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

                verifiedToken = jwt.verify(
                    tokenToVerify,
                    config.jwt_secret as string
                ) as JwtPayload;
            } catch (error) {
                throw new Error('You are not authorized!');
            }

            const { role, email } = verifiedToken;

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });

            if (!user) {
                throw new Error('User not found!');
            }

            if (requiredRoles.length && !requiredRoles.includes(role)) {
                throw new Error('You are not authorized!');
            }

            req.user = verifiedToken; // Need to extend Express Request type
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default auth;
