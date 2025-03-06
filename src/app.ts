import cookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import { ZodError } from "zod";

import { env } from "./env";
import { userRoutes } from "./http/controllers/user/route";

export const app = fastify();

app.register(fastifySwagger, {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Fastify API",
      version: "1.0.0",
      description: "API de exemplo com Fastify e Swagger",
    },
    servers: [{ url: "http://localhost:3333" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: "10m",
  },
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
});

app.register(cookie);

app.register(userRoutes);

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } 
  // else {
  //   // para fazer: log para producao como DataDog/NewRelic/Sentry
  // }

  return reply.status(500).send({ message: "Internal server error" });
});
