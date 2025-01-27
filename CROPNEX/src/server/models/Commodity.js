import mongoose from 'mongoose';

const commoditySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  predictedPrice: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Commodity', commoditySchema);