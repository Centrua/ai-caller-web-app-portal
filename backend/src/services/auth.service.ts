import { OAuth2Client } from 'google-auth-library'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/user.repository'
import { sendUserApprovalEmail } from './centrua-email.service'

export class AuthService {
  private userRepository = new UserRepository()
  private oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  getGoogleAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to receive a refresh token
      prompt: 'consent',     // Forces the consent screen to ensure refresh token emission
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
    })
  }

  async handleGoogleCallback(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)

    if (!tokens.id_token) {
      throw new Error('Failed to retrieve ID token from Google.')
    }

    const ticket = await this.oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      throw new Error('Google payload missing email.')
    }

    let user = await this.userRepository.findByEmail(payload.email)
    if (!user) {
      user = await this.userRepository.create({
        email: payload.email,
        password: '', 
        google_refresh_token: tokens.refresh_token || null,
        is_approved: false,
      })
    } 
    else if (tokens.refresh_token) {
      await this.userRepository.updateRefreshToken(user.id, tokens.refresh_token)
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return { token, user }
  }

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
      is_approved: false,
    })

    await sendUserApprovalEmail({
      to: process.env.COMPANY_GMAIL_USER || '',
      username: user.name || 'User',
      email: user.email,
      venueId: data.venueId,
      userId: user.id,
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
        is_approved: user.is_approved,
      },
    }
  }

  async updateApprovalStatus(userId: number, isApproved: boolean): Promise<void> {
    await this.userRepository.updateApprovalStatus(userId, isApproved)
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
        is_approved: user.is_approved,
      },
    }
  }
}