const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://seacowsow:3utAh6FB_Q-rMj7@awde1.hwj5k.mongodb.net/?retryWrites=true&w=majority&appName=awde1', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
