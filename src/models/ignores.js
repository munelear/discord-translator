const mongoose = require('mongoose');

const ignoreSchema = new mongoose.Schema({
  guildId: {type: String, required: true},
  prefix: {type: String, required: true}
});

ignoreSchema.statics.getGuildIgnores = async function(guildId) {
  return await this.find({guildId: guildId}).exec();
};

ignoreSchema.statics.deleteGuildIgnores = async function(guildId) {
  return await this.deleteMany({guildId: guildId}).exec();
};

ignoreSchema.statics.deleteIgnore = async function(guildId, prefix) {
  return await this.deleteOne({
    guildId: guildId,
    prefix: prefix
  }).exec();
};

ignoreSchema.statics.addIgnore = async function(guildId, prefix) {
  return await this.findOneAndUpdate({
    guildId: guildId,
    prefix: prefix
  }, {
    guildId: guildId,
    prefix: prefix
  }, {
    upsert: true,
    new: true
  }).exec();
};

const Ignore = mongoose.model('ignores', ignoreSchema);
module.exports = Ignore;