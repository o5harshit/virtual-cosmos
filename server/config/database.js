import mongoose from 'mongoose'

export async function connectDatabase() {
  if (!process.env.MONGO_URI) {
    console.log('MongoDB skipped: MONGO_URI not found')
    return
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.log('MongoDB skipped:', error.message)
  }
}
