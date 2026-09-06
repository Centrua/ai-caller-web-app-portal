import { sequelize } from '../config/database'
import Conversation from './conversation.model'
import Message from './message.model'
import Venue from './venue.model'

const models = {
  Conversation,
  Message,
  Venue,
}

Object.keys(models).forEach((modelName) => {
  const model = (models as any)[modelName]
  if (model.associate) {
    model.associate(models)
  }
})

export { sequelize, Conversation, Message, Venue }
export default models