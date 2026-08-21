import { User } from '../../shared/database/models';

export class UserService {
  async list() {
    return User.findAll({ attributes: { exclude: ['passwordHash'] } });
  }
}

export const userService = new UserService();
