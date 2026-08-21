import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../app/config/config';
import { User } from '../../shared/database/models';
import { AppError } from '../../shared/errors/AppError';
import { LoginDto } from './auth.dto';

export class AuthService {
  async login(dto: LoginDto) {
    const user = await User.findOne({ where: { email: dto.email } });
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    };
  }

  async me(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }
}

export const authService = new AuthService();
