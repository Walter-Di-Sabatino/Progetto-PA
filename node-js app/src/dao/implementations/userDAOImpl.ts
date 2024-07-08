import User, { UserAttributes, UserCreationAttributes } from '../../models/user';
import IUserDAO from '../interfaces/iUserDAO';

class UserDAO implements IUserDAO {

  private static instance: UserDAO;

  private constructor() {
  }

  public static getInstance(): UserDAO {
    if (!UserDAO.instance) {
      UserDAO.instance = new UserDAO();
    }
    return UserDAO.instance;
  }

  async create(user: UserCreationAttributes): Promise<UserAttributes> {
    const newUser = await User.create(user);
    return newUser.toJSON() as UserAttributes;
  }

  async findAll(): Promise<UserAttributes[]> {
    const users = await User.findAll();
    return users.map(User => User.toJSON() as UserAttributes);
  }  

  async findById(id: number): Promise<UserAttributes | null> {
    const user = await User.findByPk(id);
    return user ? user.toJSON() as UserAttributes : null;
  }

  async findByEmail(email: string): Promise<UserAttributes | null> {
    const user = await User.findOne({ where: { email } });
    return user ? user.toJSON() as UserAttributes : null;
  }

  async update(id: number, updates: Partial<UserAttributes>): Promise<boolean> {
    const [updatedRows] = await User.update(updates, { where: { id } });
    return updatedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const deletedRows = await User.destroy({ where: { id } });
    return deletedRows > 0;
  }
}

export default UserDAO;
