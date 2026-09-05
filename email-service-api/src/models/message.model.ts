import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface MessageAttributes {
  id: string
  thread_id: string
  grant_id: string
  snippet?: string | null
  from?: any
  to?: any
}

type MessageCreationAttributes = Optional<MessageAttributes, 'id'>

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string
  public thread_id!: string
  public grant_id!: string
  public snippet!: string | null
  public from!: any
  public to!: any
}

Message.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    thread_id: { type: DataTypes.STRING, allowNull: false },
    grant_id: { type: DataTypes.STRING, allowNull: false },
    snippet: { type: DataTypes.TEXT },
    from: { type: DataTypes.JSONB },
    to: { type: DataTypes.JSONB },
  },
  {
    tableName: 'messages',
    sequelize,
    underscored: true,
    timestamps: true,
  }
)

export default Message
