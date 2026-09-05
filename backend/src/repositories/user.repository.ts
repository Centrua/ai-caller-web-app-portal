import { User } from '../models/user.model';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({
      where: { email },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }

  async create(userData: {
    email: string;
    password?: string;
    role?: string;
    [key: string]: any;
  }): Promise<User> {
    return await User.create(userData as any);
  }
}