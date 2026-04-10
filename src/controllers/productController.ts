import { Request, Response } from "express";
import prisma from "../config/prisma";


const getAllProducts = async (req : Request , res : Response)=> {
    try {
        const product = await prisma.product.findMany({
            include: {
            category: true,
            user: {
                select: {
                id: true,
                name: true,
                email: true
                }
            }
            },
        });

        return res.status(200).json({
            message : "Products fetched successfully",
            product,
        });


    } catch (error : any) {
        console.error("GET PRODUCTS ERROR:",error.message);

        return res.status(500).json({
            message : "something is wrong"
        });

    };
};


const getSingleProduct = async (req : Request, res : Response) => {
    try {

        const { id } = req.params;

        const product  = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
            category: true,
            user: {
                select: {
                id: true,
                name: true,
                email: true
                }
            }
            },
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.status(200).json({
            message : "product fetched successfully ",
            product ,
        });
        
    } catch (error : any ){
        console.error("Get Sinle Product Error", error.message);

        return res.status(500).json({
            message : "something is wrong"
        });
    };
};


export default {
    getAllProducts,
    getSingleProduct
}