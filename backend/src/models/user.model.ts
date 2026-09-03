import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database'; // Adjust to your actual path

interface UserAttributes {
  id: number;
  name?: string | null;
  email: string;
  password?: string | null;
  role: string;
  google_refresh_token?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'name' | 'password' | 'google_refresh_token' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public declare id: number;
  public declare name: string | null;
  public declare email: string;
  public declare password: string | null;
  public declare role: string;
  public declare google_refresh_token: string | null;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  public static associate(models: any) {
    // define associations here if needed
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Nullable to accommodate Google OAuth users
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    google_refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  }
);