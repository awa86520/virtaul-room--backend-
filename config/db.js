const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
           // useNewUrlParser: true,
            //useUnifiedTopology: true
        });
        console.log(` MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit on failure
    }
};

module.exports = connectDB; // ✅ Ensure it's exported properly

