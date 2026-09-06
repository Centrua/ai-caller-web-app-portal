import { Model, DataTypes, Optional } from 'sequelize'
import { sequelize } from '../config/database'
import Venue from './venue.model'

interface VenueSettingsAttributes {
  id: number
  venue_id: number
  auto_send_replies: boolean
  email_ai_routing?: boolean
  created_at?: Date
  updated_at?: Date
}

interface VenueSettingsCreationAttributes extends Optional<VenueSettingsAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class VenueSettings extends Model<VenueSettingsAttributes, VenueSettingsCreationAttributes> implements VenueSettingsAttributes {
  public declare id: number
  public declare venue_id: number
  public declare auto_send_replies: boolean
  public declare email_ai_routing: boolean | undefined
  public declare readonly created_at: Date
  public declare readonly updated_at: Date

  public static associate(models: any) {
    VenueSettings.belongsTo(models.Venue, { foreignKey: 'venue_id', as: 'venue' })
  }
}

VenueSettings.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    venue_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    auto_send_replies: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    email_ai_routing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'VenueSettings',
    tableName: 'venue_settings',
    underscored: true,
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  }
)

export default VenueSettings
