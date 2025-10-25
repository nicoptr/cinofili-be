import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyCron from "fastify-cron";
import * as process from "process";
import { LOGGER } from "@utils/winston";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { bootstrap } from "fastify-decorators";
import { AuthController } from "@controllers/AuthController";
import { ZodError } from "zod";
import { FastifyApplication } from "../types";
import { UserController } from "@controllers/UserController";
import { HttpError } from "http-errors";
import { ImageController } from "@controllers/ImageController";
import { HiddenComponentConfigController } from "@controllers/HiddenComponentConfigController";
import { RoleController } from "@controllers/RoleController";
import { removeAnsi } from "@utils/prisma";
import { Container } from "inversify";
import {EventController} from "@controllers/EventController";
import {CategoryController} from "@controllers/CategoryController";

export class APIServer {
    private readonly server: FastifyApplication;

    constructor() {
        const app = fastify({
            logger: process.env.NODE_ENV === 'development',
            disableRequestLogging: true,
            pluginTimeout: 100000,
        })
        this.server = app.withTypeProvider<ZodTypeProvider>();
        this.setupMultipart();
        this.configureAuthentication();
        this.addSecurityConfiguration();
        this.configureSwagger();
        this.configureCors();
        this.registerController();
        this.setupFastifyConfiguration();
    }

    public async start() {
        try {
            await this.server.ready();
            this.server.swagger();
            await this.server.listen({ host: process.env.HOST!, port: +process.env.PORT! })
                .then(async () => {
                    LOGGER.info(`API Server up and running in ${process.env.NODE_ENV} environment on port ${process.env.PORT!}!`);
                    LOGGER.info(`OpenAPI docs available at http://localhost:${process.env.PORT!}/docs`);
                });
        } catch (err) {
            this.server.log.error(err);
            process.exit(1);
        }
    }

    public async stop() {
        return new Promise<boolean>(async resolve => {

            if (this.server) {
                this.server.close(() => resolve(true));
            } else {
                return resolve(true);
            }
        });
    }

    private setupFastifyConfiguration() {
        LOGGER.info("Setup Fastify Configuration!");

        this.server.setValidatorCompiler(validatorCompiler);
        this.server.setSerializerCompiler(serializerCompiler);
        this.server.setErrorHandler(
            (error: Error, req: FastifyRequest, reply: FastifyReply) => {
                LOGGER.error(`${error} \n ${error.stack}`);
                if (error instanceof ZodError) {
                    reply.status(400).send({
                        error: error.name,
                        message: "Schema validation error",
                        issues: error.issues,
                    });
                    LOGGER.warn("End of error log");
                    return;
                }

                if (error instanceof HttpError) {
                    return reply.status(error.statusCode).send({
                        error: "HttpError",
                        code: error.statusCode,
                        message: removeAnsi(error.message),
                        ...(process.env.NODE_ENV === "development" && {
                            stack: removeAnsi(error.stack ?? ""),
                        }),
                    });
                }

                reply.status(500).send({
                    error: error.name,
                    message: removeAnsi(error.message),
                    details: (error as any).details,
                });
            }
        );
    }

    private configureAuthentication() {
        LOGGER.info("Setup Authenticator!");
        this.server.register(fastifyJwt, {
            secret: process.env.JWT_SECRET!,
            sign: {
                expiresIn: process.env.NODE_ENV === "production" ? "1d" : "30d"
            }
        });
    }

    private addSecurityConfiguration() {
        this.server.register(fastifyHelmet, {
            contentSecurityPolicy: {
                directives: {
                    ...fastifyHelmet.contentSecurityPolicy.getDefaultDirectives(),
                    "script-src": ["'self'", "'unsafe-inline'"],
                },
            },
            crossOriginOpenerPolicy: {
                policy: "unsafe-none",
            },
        });
    }

    private configureCors() {
        LOGGER.info("Setup CORS configuration!");
        this.server.register(fastifyCors, {
            origin: process.env.NODE_ENV !== "production"
                ? [
                    "*",
                    // "http://localhost:4200"
                ]
                : [
                    "*"
                    // List of URLs allowed to call the API in production env from browsers
                    // "https://google.com",
                ],
        });
    }

    private configureSwagger() {
        LOGGER.info("Setup SWAGGER!");

        this.server.register(fastifySwagger, {
            openapi: {
                info: {
                    title: "",
                    description: process.env.npm_package_version!,
                    version: process.env.npm_package_version!,
                },
                components: {
                    securitySchemes: {
                        apiKey: {
                            type: "apiKey",
                            description: "Bearer token",
                            name: "Authorization",
                            in: "header",
                        },
                    },
                },
            },
            transform: jsonSchemaTransform,
            hideUntagged: true
        });

        this.server.register(fastifySwaggerUI, {
            routePrefix: "/docs",
            staticCSP:
                "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data: validator.swagger.io; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'none'; style-src 'self' fonts.googleapis.com; upgrade-insecure-requests;",
            theme: {
                title: "Cinofili API",
            },
            initOAuth: undefined,
            uiConfig: {
                persistAuthorization: true,
            }
        });

    }

    private registerController() {
        LOGGER.info("Load All Controllers!");
        // Log.info(resolve(__dirname, "controllers"));

        this.server.register(bootstrap, {
            // directory: resolve(__dirname, "controllers"),
            // mask: /\.controller\./,
            controllers: [
                ...[ AuthController ],
                ...[
                    AuthController,
                    ImageController,
                    HiddenComponentConfigController,
                    RoleController,
                    UserController,
                    EventController,
                    CategoryController,
                ].sort((curr, next) => curr.name < next.name ? -1 : 1 )
            ],
            prefix: "/api"
        });
    }

    private setupMultipart() {
        LOGGER.info("Setup Multipart Configuration!");

        this.server.register(fastifyMultipart);
    }

}
