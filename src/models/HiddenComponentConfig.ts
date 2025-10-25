import { z } from "zod";
import { RoleName } from "@prisma/client";
import { exz } from "@utils/exz";

export const HiddenComponentConfigSchema = z.object({
    id: z.number().int().optional(),
    roleName: z.nativeEnum(RoleName),
    context: z.string(),
    section: z.string(),
    component: z.string(),
    isActive: z.boolean(),
});

export type HiddenComponentConfigDTO = z.infer<typeof HiddenComponentConfigSchema>;

export const HiddenComponentConfigCreateSchema = HiddenComponentConfigSchema.omit({ id: true, roleName: true }).extend({
    roles: z.nativeEnum(RoleName).array(),
});
export type HiddenComponentConfigCreateDTO = z.infer<typeof HiddenComponentConfigCreateSchema>;

export const HiddenComponentConfigPaginateBodyInputSchema = z.lazy(() => z.object({
    query: HiddenComponentConfigQuerySchema,
    options: exz.paginateOptions
}));
export type HiddenComponentConfigPaginateDTO = z.infer<typeof HiddenComponentConfigPaginateBodyInputSchema>;

export const HiddenComponentConfigQuerySchema = z.object({
    value: z.string().optional(),
    isActive: z.boolean().optional(),
    roles: z.nativeEnum(RoleName).array().optional(),
});
export type HiddenComponentConfigQueryDTO = z.infer<typeof HiddenComponentConfigQuerySchema>;
