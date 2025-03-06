"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/usecases/factories/users/make-register-use-case.ts
var make_register_use_case_exports = {};
__export(make_register_use_case_exports, {
  makeRegisterUseCase: () => makeRegisterUseCase
});
module.exports = __toCommonJS(make_register_use_case_exports);

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

// src/usecases/errors/user-already-exists.ts
var UserAlreadyExistsError = class extends Error {
  constructor() {
    super("E-mail already exists");
  }
};

// src/usecases/register.ts
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  makeRegisterUseCase
});
