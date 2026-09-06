import { sequelize } from '../config/database'
import Conversation from './conversation.model'
import Message from './message.model'
import Venue from './venue.model'
import Outgoing from './outgoing.model'

const models = {
  Conversation,
  Message,
  Venue,
  Outgoing,
}

Object.keys(models).forEach((modelName) => {
  const model = (models as any)[modelName]
  if (model.associate) {
    model.associate(models)
  }
})

export { sequelize, Conversation, Message, Venue, Outgoing }
export default models