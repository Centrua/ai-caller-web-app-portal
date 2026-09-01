import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

interface VenueAttributes {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  elevenlabs_agent_id: string | null;
  elevenlabs_phone_number_id: string | null;
  associated_users: number[];
  created_at?: Date;
}

interface VenueCreationAttributes extends Optional<VenueAttributes, 'id' | 'email' | 'phone' | 'elevenlabs_agent_id' | 'elevenlabs_phone_number_id' | 'associated_users' | 'created_at'> {}

export class Venue extends Model<VenueAttributes, VenueCreationAttributes> implements VenueAttributes {
  public id!: number;
  public name!: string;
  public email!: string | null;
  public phone!: string | null;
  public elevenlabs_agent_id!: string | null;
  public elevenlabs_phone_number_id!: string | null;
  public associated_users!: number[];
  public readonly created_at!: Date;

  public static associate(models: any) {
    models.Venue.hasMany(models.KnowledgeSource, {
      foreignKey: 'venue_id',
      as: 'knowledgeSources',
    });
  }
}

export default function (sequelize: Sequelize): typeof Venue {
  Venue.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      elevenlabs_agent_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      elevenlabs_phone_number_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      associated_users: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: 'Venue',
      tableName: 'venues',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  return Venue;
}