import { Model, DataTypes, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface ActionItemAttributes {
  id: number
  conversationId: string
  completed: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface ActionItemCreationAttributes extends Optional<ActionItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ActionItem extends Model<ActionItemAttributes, ActionItemCreationAttributes> implements ActionItemAttributes {
  public declare id: number
  public declare conversationId: string
  public declare completed: boolean
  public declare readonly createdAt: Date
  public declare readonly updatedAt: Date
}

ActionItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'conversation_id',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'ActionItem',
    tableName: 'action_items',
    underscored: true,
    timestamps: true,
  }
)

export default ActionItem
