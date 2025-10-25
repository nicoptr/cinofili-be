import { FastifyReply, FastifyRequest } from "fastify";
import { Controller, POST } from "fastify-decorators";

import { Authenticate } from "@middleware/Authenticate";
import { ImageService } from "@services/ImageService";
import { z } from "zod";
import httpErrors from "http-errors";
import { HasPermission } from "@middleware/HasPermission";
import { PermissionAction } from "../enums/PermissionAction";
import { PermissionScope } from "../enums/PermissionScope";

@Controller({
    route: "/images",
    tags: [{ name: "Images", description: "Image management" }],
})
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    private static readonly ENTITY_NAME = "IMAGE";


    @POST("/upload", {
        schema: {
            operationId: "uploadImage",
            summary: "Upload Image",
            response: {
                200: z.any().describe("Upload Image"),
            },
            security: [
                {
                    apiKey: []
                }
            ],
        },
        onRequest: [
            Authenticate(),
            HasPermission(PermissionAction.CREATE, ImageController.ENTITY_NAME, PermissionScope.ALL),
        ],
    })
    async create(
        req: FastifyRequest,
        reply: FastifyReply
    ) {
        const data = await req.file({ limits: { fileSize: 150000000 } });
        if(data?.file.truncated) {
            throw httpErrors.BadRequest("La dimensione del file è troppo elevata!");
        }

        if(data?.file.bytesRead && data?.file.bytesRead < 0) {
            throw httpErrors.BadRequest();
        }
        
        reply
            .status(200)
            .send({ url: await this.imageService.upload(data!)});
    }
}
