import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description too short"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative(),
  categoryId: z.number()
});

export const updateProductSchema = createProductSchema.partial();