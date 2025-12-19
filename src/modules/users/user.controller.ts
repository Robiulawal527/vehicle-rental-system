import { NextFunction, Request, Response } from "express";

import { deleteUserById, getAllUsers, updateUserById } from "./user.service";

export const getAllUsersController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params.userId);

    const requester = req.user;
    if (!requester) {
      const error = new Error("User not authenticated");
      (error as any).statusCode = 401;
      throw error;
    }

    const isAdmin = requester.role === "admin";
    const isSelf = requester.id === userId;

    if (!isAdmin && !isSelf) {
      const error = new Error("You do not have permission to perform this action");
      (error as any).statusCode = 403;
      throw error;
    }

    const updated = await updateUserById(userId, req.body, {
      allowRoleUpdate: isAdmin,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params.userId);

    await deleteUserById(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
