import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface EmailConversationRouteAttributes {
  id: number
  venue_id: number
  email_thread_id: string
  elevenlabs_conversation_id: string | null
  last_email_message_id: string | null
  reply_to_email: string | null
  subject: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface EmailConversationRouteCreationAttributes extends Optional<EmailConversationRouteAttributes, 'id' | 'elevenlabs_conversation_id' | 'last_email_message_id' | 'reply_to_email' | 'subject' | 'createdAt' | 'updatedAt'> {}

export class EmailConversationRoute extends Model<EmailConversationRouteAttributes, EmailConversationRouteCreationAttributes> implements EmailConversationRouteAttributes {
  public declare id: number
  public declare venue_id: number
  public declare email_thread_id: string
  public declare elevenlabs_conversation_id: string | null
  public declare last_email_message_id: string | null
  public declare reply_to_email: string | null
  public declare subject: string | null
  public declare readonly createdAt: Date
  public declare readonly updatedAt: Date
}

EmailConversationRoute.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    venue_id: { type: DataTypes.INTEGER, allowNull: false },
    email_thread_id: { type: DataTypes.STRING, allowNull: false },
    elevenlabs_conversation_id: { type: DataTypes.STRING, allowNull: true },
    last_email_message_id: { type: DataTypes.STRING, allowNull: true },
    reply_to_email: { type: DataTypes.STRING, allowNull: true },
    subject: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'EmailConversationRoute',
    tableName: 'email_conversation_routes',
    underscored: true,
  }
)

export default EmailConversationRoute