import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface OutgoingAttributes {
  id: number
  original_message_id?: string | null
  thread_id?: string | null
  grant_id?: string | null
  subject?: string | null
  body?: string | null
  status?: string | null
  gemini_response?: any
}

type OutgoingCreationAttributes = Optional<OutgoingAttributes, 'id'>

export class Outgoing extends Model<OutgoingAttributes, OutgoingCreationAttributes> implements OutgoingAttributes {
  public id!: number
  public original_message_id!: string | null
  public thread_id!: string | null
  public grant_id!: string | null
  public subject!: string | null
  public body!: string | null
  public status!: string | null
  public gemini_response!: any
}

Outgoing.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    original_message_id: { type: DataTypes.STRING },
    thread_id: { type: DataTypes.STRING },
    grant_id: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING },
    body: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
    gemini_response: { type: DataTypes.JSONB },
  },
  {
    tableName: 'outgoing_drafts',
    sequelize,
    underscored: true,
    timestamps: true,
  }
)

export default Outgoing
