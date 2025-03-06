import { compare } from "bcryptjs";
import type { User } from "@prisma/client";
import type { UsersRepository } from "@/repositories/utils/users-repository";
import { InvalidCredentialsError } from "./errors/invalid-credentials-error";

interface AuthenticUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticUseCaseResponse {
  user: User;
}

export class AuthenticUseCase {
  constructor( private readonly usersRepository: UsersRepository ) {}

  async execute({
    email,
    password,
  }: AuthenticUseCaseRequest): Promise<AuthenticUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await compare(password, user.password_hash);

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    return {
      user,
    };
  }
}
