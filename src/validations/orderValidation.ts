import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Invalid address ID",
    }),
});