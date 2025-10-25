import * as z from "zod"
import { RoleName } from "@prisma/client"
import { CompleteRole, RelatedRoleModel } from "./index"

export const HiddenComponentConfigModel = z.object({
  id: z.number().int(),
  roleName: z.nativeEnum(RoleName),
  context: z.string(),
  section: z.string(),
  component: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteHiddenComponentConfig extends z.infer<typeof HiddenComponentConfigModel> {
  role: CompleteRole
}

/**
 * RelatedHiddenComponentConfigModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedHiddenComponentConfigModel: z.ZodSchema<CompleteHiddenComponentConfig> = z.lazy(() => HiddenComponentConfigModel.extend({
  role: RelatedRoleModel,
}))
