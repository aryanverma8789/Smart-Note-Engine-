const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Note = require('../models/Note');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  // Remove test users (keep real user Aryan18)
  const del1 = await User.deleteMany({
    username: { $in: ['testuser_1783334391295', 'logintest_1783405939519', 'TestUser'] }
  });
  const del2 = await Note.deleteMany({});
  console.log('Cleaned', del1.deletedCount, 'test users,', del2.deletedCount, 'notes');
  
  const remaining = await User.find({}).select('username email');
  console.log('Remaining users:', remaining.map(u => u.username + ' <' + u.email + '>').join(', '));
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
