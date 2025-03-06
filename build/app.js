"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_cookie = __toESM(require("@fastify/cookie"));
var import_jwt = __toESM(require("@fastify/jwt"));
var import_swagger = __toESM(require("@fastify/swagger"));
var import_swagger_ui = __toESM(require("@fastify/swagger-ui"));
var import_fastify = __toESM(require("fastify"));
var import_zod4 = require("zod");

// src/env/index.ts
var import_zod = require("zod");
var import_config = require("dotenv/config");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["dev", "test", "production"]).default("dev"),
  JWT_SECRET: import_zod.z.string(),
  PORT: import_zod.z.coerce.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/usecases/errors/user-already-exists.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists");
  }
};

// src/lib/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: env.NODE_ENV === "dev" ? ["query"] : []
});

// src/repositories/prisma/users-repository.ts
var PrismaUsersRepository = class {
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });
    return user;
  }
  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    return user;
  }
  async create(data) {
    const user = await prisma.user.create({
      data
    });
    return user;
  }
};

// src/usecases/register.ts
var import_bcryptjs = require("bcryptjs");
var RegisterUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    name,
    email,
    password
  }) {
    const userEmailCheks = await this.usersRepository.findByEmail(email);
    if (userEmailCheks) {
      throw new UserAlreadyExistsError();
    }
    const password_hash = await (0, import_bcryptjs.hash)(password, 6);
    const user = await this.usersRepository.create({
      name,
      email,
      password_hash
    });
    return {
      user
    };
  }
};

// src/usecases/factories/users/make-register-use-case.ts
function makeRegisterUseCase() {
  const UsersRepository = new PrismaUsersRepository();
  const registerUserCase = new RegisterUseCase(UsersRepository);
  return registerUserCase;
}

// src/http/controllers/user/register.controller.ts
var import_zod2 = require("zod");
async function register(request, reply) {
  const registerBodySchema = import_zod2.z.object({
    name: import_zod2.z.string(),
    email: import_zod2.z.string().email(),
    password: import_zod2.z.string().min(6)
  });
  const { name, email, password } = registerBodySchema.parse(request.body);
  try {
    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute({
      name,
      email,
      password
    });
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }
  return reply.status(201).send();
}

// src/usecases/errors/invalid-credentials-error.ts
var InvalidCredentialsError = class extends Error {
  constructor() {
    super("Invalid Credentials Error");
  }
};

// src/usecases/authenticate.ts
var import_bcryptjs2 = require("bcryptjs");
var AuthenticUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({
    email,
    password
  }) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const doesPasswordMatches = await (0, import_bcryptjs2.compare)(password, user.password_hash);
    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }
    return {
      user
    };
  }
};

// src/usecases/factories/users/make-authenticate-use-case.ts
function makeAuthenticateUseCase() {
  const UsersRepository = new PrismaUsersRepository();
  const authenticateUseCase = new AuthenticUseCase(UsersRepository);
  return authenticateUseCase;
}

// src/http/controllers/user/authenticate.controller.ts
var import_zod3 = require("zod");
async function authenticate(request, reply) {
  const authenticateBodySchema = import_zod3.z.object({
    email: import_zod3.z.string().email(),
    password: import_zod3.z.string().min(6)
  });
  const { email, password } = authenticateBodySchema.parse(request.body);
  try {
    const authenticateUseCase = makeAuthenticateUseCase();
    const { user } = await authenticateUseCase.execute({
      email,
      password
    });
    const token = await reply.jwtSign(
      {
        role: user.role
      },
      {
        sign: {
          sub: user.id
        }
      }
    );
    const refreshToken = await reply.jwtSign(
      { role: user.role },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d"
        }
      }
    );
    return reply.setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: true,
      sameSite: true,
      httpOnly: true
    }).status(200).send({ token });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return reply.status(400).send({ message: err.message });
    }
    throw err;
  }
}

// src/http/middlewares/verify.jwt.ts
async function verifyJWT(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}

// src/usecases/errors/resource-not-found-error.ts
var ResourceNotFoundError = class extends Error {
  constructor() {
    super("Resource Not Found");
  }
};

// src/usecases/get-user-profile.ts
var GetUserProfileUseCase = class {
  constructor(usersRepository) {
    this.usersRepository = usersRepository;
  }
  async execute({ userId }) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ResourceNotFoundError();
    }
    return { user };
  }
};

// src/usecases/factories/users/make-get-user-profile.ts
function makeGetUserProfileUseCase() {
  const UsersRepository = new PrismaUsersRepository();
  const useCase = new GetUserProfileUseCase(UsersRepository);
  return useCase;
}

// src/http/controllers/user/get-user-profile.controller.ts
async function profile(request, reply) {
  const getUserProfile = makeGetUserProfileUseCase();
  const { user } = await getUserProfile.execute({ userId: request.user.sub });
  return reply.status(200).send({ user: { ...user, password_hash: void 0 } });
}

// src/http/controllers/user/route.ts
async function userRoutes(app2) {
  app2.post(
    "/users",
    {
      schema: {
        description: "Registra um novo usu\xE1rio",
        tags: ["Usu\xE1rios"],
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", description: "Nome do usu\xE1rio" },
            email: {
              type: "string",
              format: "email",
              description: "E-mail do usu\xE1rio"
            },
            password: {
              type: "string",
              minLength: 6,
              description: "Senha do usu\xE1rio"
            }
          }
        },
        response: {
          201: {
            description: "Usu\xE1rio registrado com sucesso",
            type: "null"
          },
          400: {
            description: "Erro de valida\xE7\xE3o",
            type: "object",
            properties: {
              message: { type: "string" }
            }
          },
          409: {
            description: "Usu\xE1rio j\xE1 existe",
            type: "object",
            properties: {
              message: { type: "string" }
            }
          }
        }
      }
    },
    register
  );
  app2.post(
    "/users/sessions",
    {
      schema: {
        description: "Autentica um usu\xE1rio",
        tags: ["Usu\xE1rios"],
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "E-mail do usu\xE1rio"
            },
            password: {
              type: "string",
              minLength: 6,
              description: "Senha do usu\xE1rio"
            }
          }
        },
        response: {
          200: {
            description: "Usu\xE1rio autenticado com sucesso",
            type: "object",
            properties: {
              token: { type: "string" }
            }
          },
          400: {
            description: "Erro de valida\xE7\xE3o",
            type: "object",
            properties: {
              message: { type: "string" }
            }
          },
          401: {
            description: "Credenciais inv\xE1lidas",
            type: "object",
            properties: {
              message: { type: "string" }
            }
          }
        }
      }
    },
    authenticate
    // Agora a rota chama o controlador correto
  );
  app2.get(
    "/me",
    {
      schema: {
        description: "Obt\xE9m os dados do usu\xE1rio autenticado",
        tags: ["Usu\xE1rios"],
        security: [{ bearerAuth: [] }],
        // Indica que essa rota requer autenticação
        response: {
          200: {
            description: "Dados do usu\xE1rio autenticado",
            type: "object",
            properties: {
              id: { type: "string", description: "ID do usu\xE1rio" },
              name: { type: "string", description: "Nome do usu\xE1rio" },
              email: { type: "string", description: "E-mail do usu\xE1rio" },
              created_at: {
                type: "string",
                format: "date-time",
                description: "Data de cria\xE7\xE3o do usu\xE1rio"
              }
            }
          },
          401: {
            description: "Token ausente ou inv\xE1lido",
            type: "object",
            properties: {
              message: { type: "string" }
            }
          }
        }
      },
      onRequest: [verifyJWT]
      // Protege a rota com autenticação JWT
    },
    profile
  );
}

// src/app.ts
var app = (0, import_fastify.default)();
app.register(import_swagger.default, {
  mode: "dynamic",
  openapi: {
    openapi: "3.0.3",
    info: {
      title: "Fastify API",
      version: "1.0.0",
      description: "API de exemplo com Fastify e Swagger"
    },
    servers: [{ url: "http://localhost:3333" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  }
});
app.register(import_swagger_ui.default, {
  routePrefix: "/docs"
});
app.register(import_jwt.default, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: "10m"
  },
  cookie: {
    cookieName: "refreshToken",
    signed: false
  }
});
app.register(import_cookie.default);
app.register(userRoutes);
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof import_zod4.ZodError) {
    return reply.status(400).send({ message: "Validation error", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
  }
  return reply.status(500).send({ message: "Internal server error" });
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
