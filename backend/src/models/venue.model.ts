import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface VenueAttributes {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  elevenlabs_agent_id: string | null;
  nylas_grant_id?: string | null;
  kb_document_id: string | null;
  associated_user_ids: number[];
  created_at?: Date;
}

interface VenueCreationAttributes extends Optional<VenueAttributes, 'id' | 'email' | 'phone' | 'elevenlabs_agent_id' | 'kb_document_id' | 'associated_user_ids' | 'created_at'> {}

export class Venue extends Model<VenueAttributes, VenueCreationAttributes> implements VenueAttributes {
  public declare id: number;
  public declare name: string;
  public declare email: string | null;
  public declare phone: string | null;
  public declare elevenlabs_agent_id: string | null;
  public declare nylas_grant_id: string | null;
  public declare kb_document_id: string | null;
  public declare associated_user_ids: number[];
  public declare readonly created_at: Date;

  public static associate(models: any) {
    models.Venue.hasMany(models.KnowledgeSource, {
      foreignKey: 'venue_id',
      as: 'knowledgeSources',
    });
  }
}

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
    nylas_grant_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kb_document_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    associated_user_ids: {
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

export default Venue;