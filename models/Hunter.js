const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  id: Number,
  name: String,
  domain: { type: String, enum: ['personal', 'fitness', 'academic'] },
  stat: String,
  diff: String,
  baseXp: Number,
  done: { type: Boolean, default: false },
  isPenalty: { type: Boolean, default: false },
  mult: Number,
}, { _id: false });

const hunterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hunterName: { type: String, default: 'HUNTER' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpMax: { type: Number, default: 1000 },
  sp: { type: Number, default: 0 },
  cutoff: { type: String, default: '22:00' },
  stats: {
    type: Object,
    default: {
      STR: { name: 'STRENGTH', val: 10, cls: 'str' },
      AGI: { name: 'AGILITY',  val: 10, cls: 'agi' },
      INT: { name: 'INTELLIGENCE', val: 10, cls: 'int' },
      END: { name: 'ENDURANCE', val: 10, cls: 'end' },
      SEN: { name: 'SENSE',    val: 10, cls: 'sen' },
      VIT: { name: 'VITALITY', val: 10, cls: 'vit' },
    }
  },
  quests: { type: [questSchema], default: [] },
  nextId: { type: Number, default: 1 },
  streaks: {
    type: Object,
    default: { personal: 0, fitness: 0, academic: 0 }
  },
  history: { type: Array, default: [] },
  lastQuestDate: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

hunterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Hunter', hunterSchema);
