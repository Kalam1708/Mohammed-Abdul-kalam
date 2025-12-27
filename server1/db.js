const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chatbot';

async function connectWithRetry() {
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB at', mongoUri);
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    console.log('Retrying in 5s...');
    setTimeout(connectWithRetry, 5000);
  }
}
connectWithRetry();
module.exports = mongoose;