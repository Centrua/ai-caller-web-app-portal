import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../config/database'

interface LeadInquiryAttributes {
  id: number
  grant_id?: string | null
  thread_id?: string | null
  original_message_id?: string | null
  lead_info?: any
  status?: string | null
}

type LeadInquiryCreationAttributes = Optional<LeadInquiryAttributes, 'id'>

export class LeadInquiry extends Model<LeadInquiryAttributes, LeadInquiryCreationAttributes> implements LeadInquiryAttributes {
  public id!: number
  public grant_id!: string | null
  public thread_id!: string | null
  public original_message_id!: string | null
  public lead_info!: any
  public status!: string | null

  public static associate(models: any) {
    // no associations for now
  }
}

LeadInquiry.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    grant_id: { type: DataTypes.STRING },
    thread_id: { type: DataTypes.STRING },
    original_message_id: { type: DataTypes.STRING },
    lead_info: { type: DataTypes.JSONB },
    status: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: 'lead_inquiries',
    sequelize,
    underscored: true,
    timestamps: true,
  }
)

export default LeadInquiry
