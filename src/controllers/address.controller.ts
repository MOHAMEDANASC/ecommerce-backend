import { Request, Response } from "express";
import prisma from "../config/prisma";


export const addAddress = async ( req: Request, res : Response) => {
    try {
        const userId = (req as any).user.id;

        const {street, city, state, zip, country } = req.body;

        if(!street || !city || !state || !zip || !country) {
            return res.status(400).json({
                message : "All fileds are required",
            });
        };


        const address = await prisma.address.create({
            data : {
                userId,
                street,
                city,
                state,
                zip,
                country,
            },
        });

        return res.status(201).json({
            message : "addredd added successfully",
            address,
        });



    } catch (error) {
        return res.status(500).json({
            message : "something went wrong",
        });
    }
};



export const getAllAddress = async (req : Request, res : Response) => {
    try {
        const userId = (req as any).user.id;

        const addresses = await prisma.address.findMany({
            where : {
                userId,
            },
            orderBy : {
                id : "desc"
            },
        });

        return res.status(200).json({
            message : "address fetching successfully",
            count : addresses.length,
            addresses,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message : "something went wrong",
        });
    }
}



export const updateAddress = async (req : Request, res : Response) => {
    try {
        const userId = (req as any).user.id;
        const addressId = Number(req.params.id);


        const { street, city, state, zip, country} = req.body;


        const existingAddress = await prisma.address.findFirst({
            where : {
                id : addressId,
                userId,
            },
        });

        if(!existingAddress) {
            return res.status(404).json({
                message : "Address not found",
            }),
        };


        const updateAddress = await prisma.address.update({
            where : {
                id : addressId,
            },
            data : {
                street : street ?? existingAddress.street,
                city : city ?? existingAddress.city,
                state : state ?? existingAddress.state,
                zip : zip ?? existingAddress.zip,
                country : country ?? existingAddress.country,
            },
        });

        return res.status(200).json({
            message : "Address updated successfully",
            address : updateAddress,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message : "something went wrong",
        });
    }
};
