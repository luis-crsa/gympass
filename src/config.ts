import dotenv from "dotenv";

// Carrega as variáveis do arquivo .env
dotenv.config();

export const config = {
  testUserPassword: process.env.TEST_USER_PASSWORD || "defaultPassword"
};
