import {z} from "zod";
import {exz} from "@utils/exz";
import {RoleName} from "@prisma/client";

export const CategorySchema = z.object({
    name: z.string(),
    description: z.string().optional(),

});

export type CategoryDTO = z.infer<typeof CategorySchema>;

export const CategoryCreateSchema = CategorySchema;
export type CategoryCreateDTO = z.infer<typeof CategoryCreateSchema>;

export const CategoryUpdateSchema = CategorySchema.partial();
export type CategoryUpdateDTO = z.infer<typeof CategoryUpdateSchema>;

export const CategoryPaginateBodyInputSchema = z.lazy(() => z.object({
    query: CategoryQuerySchema,
    options: exz.paginateOptions
}));
export type CategoryPaginateDTO = z.infer<typeof CategoryPaginateBodyInputSchema>;

export const CategoryQuerySchema = z.object({
    value: z.string().optional(),
});
export type CategoryQueryDTO = z.infer<typeof CategoryQuerySchema>;