import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database'; // Adjust to your actual path

interface RegisterTokenAttributes {
  id: number;
  venue_id: number;
  prefix: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RegisterTokenCreationAttributes extends Optional<RegisterTokenAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class RegisterToken extends Model<RegisterTokenAttributes, RegisterTokenCreationAttributes> implements RegisterTokenAttributes {
  public declare id: number;
  public declare venue_id: number;
  public declare prefix: string;
  public declare token: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  public static associate(models: any) {
    RegisterToken.belongsTo(models.Venue, {
      foreignKey: 'venue_id',
      as: 'venue',
    });
  }
}

RegisterToken.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    venue_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prefix: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'RegisterToken',
    tableName: 'register_tokens',
    underscored: true,
  }
);