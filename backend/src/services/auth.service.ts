import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/user.repository'
import { RegisterTokenService } from './register-token.service'
import { VenueService } from './venue.service'

export class AuthService {
  private userRepository = new UserRepository()
  private venueService = new VenueService()
  private registerTokenService = new RegisterTokenService()

  async register(data: { name?: string; email: string; password: string; role?: string; registerToken: string }) {
    if (!data.registerToken) {
      throw new Error('Registration token is required.')
    }

    const venueId = await this.registerTokenService.verifyToken(data.registerToken)
    if (!venueId) {
      throw new Error('Invalid or expired registration token.')
    }

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

    await this.venueService.addAssociatedUser(venueId, user.id)

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