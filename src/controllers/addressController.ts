import { Request, Response } from "express";
import prisma from "../config/prisma";
import { addressSchema } from "../validations/addressValidator";
import { ZodError } from "zod";


const addAddress = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user.id;

        const parsedData = addressSchema.parse(req.body);
        const { street, city, state, zip, country } = parsedData;

        const address = await prisma.address.create({
            data: {
                userId,
                street,
                city,
                state,
                zip,
                country,
            },
        });

        return res.status(201).json({
            message: "Address added successfully",
            address,
        });

    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};


const getAllAddress = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user.id;

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { id: "desc" },
        });

        return res.status(200).json({
            message: "Addresses fetched successfully",
            count: addresses.length,
            addresses,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};


const updateAddress = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId = user.id;

        const addressId = Number(req.params.id);

        if (isNaN(addressId)) {
            return res.status(400).json({
                message: "Invalid address ID",
            });
        }

        const parsedData = addressSchema.parse(req.body);
        const { street, city, state, zip, country } = parsedData;

        const existingAddress = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId,
            },
        });

        if (!existingAddress) {
            return res.status(404).json({
                message: "Address not found",
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: addressId },
            data: {
                street,
                city,
                state,
                zip,
                country,
            },
        });

        return res.status(200).json({
            message: "Address updated successfully",
            address: updatedAddress,
        });

    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues,
            });
        }

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};

export default {
    addAddress,
    getAllAddress,
    updateAddress,
};