import { Request, Response } from "express";
import prisma from "../config/prisma";


export const getUserProfile = async(req : Request, res : Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await prisma.user.findUnique({
            where : { id : userId },
            select : {
                id : true,
                name : true,
                email : true,
                phone : true,
                createdAt : true,
            },
        });

        
        if(!user) {
            return res.status(404).json({
                message : "User not found",
            });
        };


        res.status(200).json({
            message : "user profile fetched successfully",
            user,
        });


    } catch(error) {
        console.error(error);
        res.status(500).json({
            message : "internal server error"
        });
    }
};



export const updateUserProfile = async (req : Request, res : Response) => {
    try {
        const userId = (req as any).user.id;
        const {name, phone } = req.body;

        if(!name && !phone){
            return res.status(400).json({
                message : "at least one filed is required"
            });
        };

        const exisitingUser = await prisma.user.findUnique({
            where : {id : userId },
        });

        if(!exisitingUser){
            return res.status(404).json({
                message : "user not found",

            });
        };


        const updatedUser = await prisma.user.update({
            where : {id : userId},
            data : {
                ...(name && {name}),
                ...(phone && {phone}),
            },
            select : {
                id :true,
                name : true,
                email : true,
                phone : true,
            },
        });


        res.status(200).json({
            message : "user profile updated successfully",
            user : updatedUser,
        });



    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message : "internal server error",
        });
    };
};


