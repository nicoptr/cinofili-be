import { z } from "zod";
import { exz } from "@utils/exz";
import { RoleToUserSchema } from "@models/RoleToUser";
import { RoleName } from "@prisma/client";
export const EventSpecificationSchema = z.object( {
    eventId: z.number(),
    categoryId: z.number(),
})
export type EventSpecificationDTO = z.infer<typeof EventSpecificationSchema>;

export const UserSchema = z.object({
    username: z.string(),
    email: z.string(),
    password: z.string(),
    avatarUrl: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
    eventSpecification: EventSpecificationSchema.optional().nullish(),

    // Relations
    roles: z.array(RoleToUserSchema).optional(),
});
export type UserDTO = z.infer<typeof UserSchema>;

export const UserRegistrationSchema = UserSchema.omit({roles: true});
export type UserRegistrationTO = z.infer<typeof UserRegistrationSchema>;

export const UserCreateSchema = UserSchema.omit({ id: true, roles: true, eventSpecification: true });
export type UserCreateDTO = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = UserSchema.partial().omit({ password: true });
export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;

export const UserPaginateBodyInputSchema = z.lazy(() => z.object({
    query: UserQuerySchema,
    options: exz.paginateOptions
}));
export type UserPaginateDTO = z.infer<typeof UserPaginateBodyInputSchema>;

export const UserQuerySchema = z.object({
    value: z.string().optional(),
    roles: z.array(z.nativeEnum(RoleName)).optional(),
});
export type UserQueryDTO = z.infer<typeof UserQuerySchema>;


