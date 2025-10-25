import { z } from "zod";

export const exz= {
    /**
     * Represents the base schema present on all models
     */
    baseSchema: z.object({
        _id: z.coerce.string().length(24),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
    }),

    /**
     * Represents an id passed as path parameter
     */
    pathId: z.object({
        id: z.string().describe("Must follow id")
    }),

    /**
     * Example for customer send: "orders invoices ..."
     */

    findOptions: z.object({
        populate: z.coerce.string().optional().describe("Populate keys"),
    }),

    /**
     * Represents an user id from external IdP
     */
    userId: z.string().uuid().describe("User ID from external IdP"),

    /**
     * Represents parameters for list endpoints
     */
    listParams: z.object({
        filter: z.record(z.string(), z.any()).optional().describe("Filter query"),
        sort: z.record(z.string(), z.enum(["asc", "desc"])).optional().describe("Map with sort keys and direction ('asc' or 'desc')"),
        page: z.coerce.number().min(1).default(1).describe("Page number"),
        limit: z.coerce.number().min(1).max(100).default(10).describe("Number of items per page"),
        populate: z.coerce.string().or(z.array(z.string())).optional().describe("Populate keys")
    }),

    /**
     * Represents a dynamic-typed paginated response for list endpoints
     */
    page<T extends z.ZodTypeAny>(itemsSchema: T) {
        return z.object({
            docs: z.array(itemsSchema).describe("Items in current page"),
            totalDocs: z.number().describe("Total number of items"),
            totalPages: z.number().describe("Number of pages"),
            hasPrevPage: z.boolean().describe("If a previous page is present"),
            hasNextPage: z.boolean().describe("If a next page is present"),
            page: z.coerce.number().optional().describe("Page number"),
            limit: z.coerce.number().describe("Number of items per page"),
            prevPage: z.coerce.number().optional().describe("Previous page"),
            nextPage: z.coerce.number().optional().describe("Next page"),
        });
    },

    /**
     * Paginate Options
     */
    paginateOptions: z.object({
        limit: z.number().min(1).default(10),
        page: z.number().min(1).default(1),
        sort: z.array(z.record(z.string(), z.string())).optional().describe("Map with sort keys and direction ('asc' or 'desc')"),
        populate: z.coerce.string().default("").describe("Populate keys"),
    }),
}

export type PaginateOptions = z.infer<typeof exz.paginateOptions>;
export type FindOptions = z.infer<typeof exz.findOptions>;
