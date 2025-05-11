import { z } from "zod";

export type Category = z.infer<typeof CategorySchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parentCategoryId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetCategorySchema = z.object({
  params: z.object({
    categoryId: z.string(),
  }),
});