import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database'; // Adjust to your actual path

interface SubscriptionRequestAttributes {
  id: number;
  name: string;
  phone_number: string;
  email: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_zip_code: string;
  approved: boolean;
  requesting_demo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionRequestCreationAttributes extends Optional<SubscriptionRequestAttributes, 'id' | 'approved' | 'requesting_demo' | 'createdAt' | 'updatedAt'> {}

export class SubscriptionRequest extends Model<SubscriptionRequestAttributes, SubscriptionRequestCreationAttributes> implements SubscriptionRequestAttributes {
  public declare id: number;
  public declare name: string;
  public declare phone_number: string;
  public declare email: string;
  public declare venue_name: string;
  public declare venue_address: string;
  public declare venue_city: string;
  public declare venue_state: string;
  public declare venue_zip_code: string;
  public declare approved: boolean;
  public declare requesting_demo: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;

  public static associate(models: any) {
    // define associations here if needed
  }
}

SubscriptionRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    venue_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue_state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    venue_zip_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    requesting_demo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'SubscriptionRequest',
    tableName: 'subscription_requests',
    underscored: true,
  }
);