import {z} from "zod";
import {exz} from "@utils/exz";
import {RoleName} from "@prisma/client";

export const SubscriptionSchema = z.object({
    movieName: z.string(),
    categoryId: z.number(),
    eventId: z.number(),
    isValid: z.boolean().optional(),
});

export type SubscriptionDTO = z.infer<typeof SubscriptionSchema>;

export const SubscriptionPlanSchema = z.object({
    projectAt: z.coerce.date().nullish().nullable(),
    location: z.string(),
});

export type SubscriptionPlanDTO = z.infer<typeof SubscriptionPlanSchema>;

export const SubscriptionCreateSchema = SubscriptionSchema;
export type SubscriptionCreateDTO = z.infer<typeof SubscriptionCreateSchema>;

export const SubscriptionUpdateSchema = SubscriptionSchema.partial();
export type SubscriptionUpdateDTO = z.infer<typeof SubscriptionUpdateSchema>;

export const SubscriptionPaginateBodyInputSchema = z.lazy(() => z.object({
    query: SubscriptionQuerySchema,
    options: exz.paginateOptions
}));
export type SubscriptionPaginateDTO = z.infer<typeof SubscriptionPaginateBodyInputSchema>;

export const SubscriptionQuerySchema = z.object({
    value: z.string().optional(),
    ownerId: z.number().optional(),
});
export type SubscriptionQueryDTO = z.infer<typeof SubscriptionQuerySchema>;