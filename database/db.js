import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const db = await mongoose.connect(`${process.env.MONGO_URI}/gym-shop`, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            maxPoolSize: 10
        })
        console.log(`Connect to MongoDB ${db.connection.host}`)

    } catch (error) {
        console.log("MONGODB connection error: ", error);
        process.exit(1);

         // Retry the connection after a delay
        //  setTimeout(dbConnect, 5000);  // Retry after 5 seconds
    }
}

export default dbConnect;