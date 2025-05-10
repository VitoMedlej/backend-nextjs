import { z } from "zod";
import { ProductSchema } from "./productModel";



export const OrderData = z.object({
  id: z.string().optional(),
  userId: z.string(),
  items: z.array(ProductSchema),
  totalAmount: z.number().positive(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrderData = z.infer<typeof OrderData>;