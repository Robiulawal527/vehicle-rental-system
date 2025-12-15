import { Request, Response, NextFunction } from "express";

import { signinUser, signupUser } from "./auth.service";

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await signupUser(req.body);

    const responseData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const signinController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, user } = await signinUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

