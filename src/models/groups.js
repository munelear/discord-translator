const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelId: {type: String, required: true},
  content: {type: String, required: true},
  time: {type: Date, default: new Date()}
});

const groupSchema = new mongoose.Schema({
  guildId: {type: String, required: true},
  recentMessages: {type: [messageSchema], default: []},
  paused: {type: Boolean, default: false}
});

groupSchema.statics.createGroup = async function(guildId) {
  try {
    let group = new Group({guildId: guildId});
    await group.save();
    return group;
  } catch (error) {
    throw (error);
  }
};

groupSchema.statics.getByGroupId = async function(groupId) {
  return await this.findOne({_id: groupId}).exec();
};

groupSchema.statics.getGroups = async function(guildId) {
  return await this.find({guildId: guildId}).exec();
};

const Group = mongoose.model('groups', groupSchema);
module.exports = Group;