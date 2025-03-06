import type { User } from '@prisma/client'
import { hash } from 'bcryptjs'
import type { UsersRepository } from '../repositories/utils/users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists'

interface RegisterUseCasesRequest {
  name: string
  email: string
  password: string
}

interface RegisterUseCaseResponse {
  user: User
}

export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCasesRequest): Promise<RegisterUseCaseResponse> {
    const userEmailCheks = await this.usersRepository.findByEmail(email)

    if (userEmailCheks) {
      throw new UserAlreadyExistsError()
    }

    const password_hash = await hash(password, 6)

    const user = await this.usersRepository.create({
      name,
      email,
      password_hash,
    })

    return {
      user,
    }
  }
}
