const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance (resilient to existing index name conflicts)
    const db = conn.connection.db;

    const ensureIndex = async (collectionName, indexSpec, options = {}) => {
      try {
        await conn.connection.collection(collectionName).createIndex(indexSpec, options);
        console.log(`✅ Index created on ${collectionName}: ${JSON.stringify(indexSpec)}`);
      } catch (err) {
        // If index with same name exists but different options, skip and log a warning
        const msg = err && err.message ? err.message : String(err);
        if (msg.includes('same name as the requested index') || msg.includes('already exists')) {
          console.warn(`⚠️ Index conflict for ${collectionName} ${JSON.stringify(indexSpec)} - skipping: ${msg}`);
        } else {
          throw err;
        }
      }
    };

    // Users collection indexes
    await ensureIndex('users', { email: 1 }, { unique: true });

    // URLs collection indexes
    await ensureIndex('urls', { shortCode: 1 }, { unique: true });
    await ensureIndex('urls', { userId: 1 });
    await ensureIndex('urls', { expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Clicks collection indexes
    await ensureIndex('clicks', { urlId: 1 });
    await ensureIndex('clicks', { shortCode: 1 });
    await ensureIndex('clicks', { timestamp: -1 });

    console.log('✅ Database indexes ensured');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;