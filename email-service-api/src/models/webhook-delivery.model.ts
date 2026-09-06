import { Model, DataTypes } from 'sequelize'
import { sequelize } from '../config/database'

export interface WebhookDeliveryAttributes {
  id: string
  createdAt?: Date
}

export class WebhookDelivery extends Model<WebhookDeliveryAttributes> implements WebhookDeliveryAttributes {
  public declare id: string
  public declare readonly createdAt: Date
}

WebhookDelivery.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'WebhookDelivery',
    tableName: 'webhook_deliveries',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
)

export default WebhookDelivery
