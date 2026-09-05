import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface ConversationAttributes {
  id: number
  thread_id: string
  grant_id: string
  subject?: string | null
}

type ConversationCreationAttributes = Optional<ConversationAttributes, 'id'>

export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number
  public thread_id!: string
  public grant_id!: string
  public subject!: string | null
}

Conversation.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    thread_id: { type: DataTypes.STRING, allowNull: false },
    grant_id: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING },
  },
  {
    tableName: 'conversations',
    sequelize,
    underscored: true,
    timestamps: true,
  }
)

export default Conversation
