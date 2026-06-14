require('dotenv').config({path: './backend/.env'});
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const email = process.argv[2] || 'dharneesh912@gmail.com';
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log(`User not found: ${email}`);
    } else {
      console.log('User found:');
      console.log({ id: user._id.toString(), email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt });
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking user:', err.message);
    process.exit(1);
  }
})();
