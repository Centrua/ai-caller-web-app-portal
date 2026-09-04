import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/user.repository'

export class AuthService {
  private userRepository = new UserRepository()
  async register(data: { name?: string; email: string; password: string; role?: string; venueId: number }) {
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new Error('User with this email already exists.')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await this.userRepository.create({
      name: data.name || '',
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
    })

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email)

    if (!user || !user.password) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    )

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }
}