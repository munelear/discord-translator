const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelId: {type: String, required: true, index: true},
  guildId: {type: String, required: true},
  groupId: {type: mongoose.ObjectId},
  language: {type: String}
});

channelSchema.statics.getById = async function(channelId) {
  return await this.findOne({channelId: channelId}).exec();
};

channelSchema.statics.getByGroupId = async function(groupId) {
  return await this.find({groupId: groupId}).exec();
};

channelSchema.statics.setLanguage = async function(channelId, guildId, language = "en") {
  return await this.findOneAndUpdate({
    channelId: channelId,
    guildId: guildId
  }, {
    channelId: channelId,
    guildId: guildId,
    language: language
  }, {
    upsert: true,
    new: true
  }).exec();
};

channelSchema.statics.setGroupId = async function(channelId, guildId, groupId) {
  return await this.findOneAndUpdate({
    channelId: channelId,
    guildId: guildId
  }, {
    channelId: channelId,
    guildId: guildId,
    groupId: groupId
  }, {
    upsert: true,
    new: true
  }).exec();
};

const Channel = mongoose.model('channels', channelSchema);
module.exports = Channel;