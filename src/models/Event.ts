import {z} from "zod";
import {exz} from "@utils/exz";
import {RoleName} from "@prisma/client";

export const EventSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    subscriptionExpiresAt: z.coerce.date(),
    numberOfParticipants: z.number(),
    categories: z.number().array().optional().nullish(),
    participants: z.number().array().optional().nullish(),
});

export type EventDTO = z.infer<typeof EventSchema>;

export const EventCreateSchema = EventSchema;
export type EventCreateDTO = z.infer<typeof EventCreateSchema>;

export const EventUpdateSchema = EventSchema.omit({ categories: true, participants: true }).partial();
export type EventUpdateDTO = z.infer<typeof EventUpdateSchema>;

export const EventPaginateBodyInputSchema = z.lazy(() => z.object({
    query: EventQuerySchema,
    options: exz.paginateOptions
}));
export type EventPaginateDTO = z.infer<typeof EventPaginateBodyInputSchema>;

export const EventQuerySchema = z.object({
    value: z.string().optional(),
});
export type EventQueryDTO = z.infer<typeof EventQuerySchema>;