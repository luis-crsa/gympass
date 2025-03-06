import { beforeEach, describe, expect, it } from "vitest";
import { hash } from "bcryptjs";
import { AuthenticUseCase } from "./authenticate";
import { InMemoryUsersRepository } from "@/repositories/in-memory/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { config } from "../config";

let usersRepository: InMemoryUsersRepository;
let sut: AuthenticUseCase;

describe("Authenticate Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new AuthenticUseCase(usersRepository);
  });

  // Unit test
  it("should be able to authenticate", async () => {
    await usersRepository.create({
      name: "John Doe",
      email: "john.doe@gmail.com",
      password_hash: await hash(config.testUserPassword, 6),
    });

    const { user } = await sut.execute({
      email: "john.doe@gmail.com",
      password: config.testUserPassword,
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("shouldn`t be able to authenticate with wrong email", async () => {
    await expect(() =>
      sut.execute({
        email: "john.doe@gmail.com",
        password: config.testUserPassword,
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("shouldn`t be able to authenticate with wrong password", async () => {
    await usersRepository.create({
      name: "John Doe",
      email: "john.doe@gmail.com",
      password_hash: await hash("flamengo", 6),
    });

    await expect(() =>
      sut.execute({
        email: "john.doe@gmail.com",
        password: config.testUserPassword,
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
