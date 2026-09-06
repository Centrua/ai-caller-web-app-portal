import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface VenueAttributes {
  id: number
  nylas_grant_id?: string | null
  agent_id?: string | null
  created_at?: Date
  updated_at?: Date
}

interface VenueCreationAttributes extends Optional<VenueAttributes, 'id' | 'nylas_grant_id' | 'agent_id' | 'created_at' | 'updated_at'> {}

export class Venue extends Model<VenueAttributes, VenueCreationAttributes> implements VenueAttributes {
  public declare id: number
  public declare nylas_grant_id: string | null
  public declare agent_id: string | null
  public declare readonly created_at: Date
  public declare readonly updated_at: Date
  public static associate(models: any) {
    Venue.hasOne(models.VenueSettings, { foreignKey: 'venue_id', as: 'settings' })
  }
}

Venue.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nylas_grant_id: { type: DataTypes.STRING, allowNull: true },
    agent_id: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Venue',
    tableName: 'venues',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
)

export default Venue
