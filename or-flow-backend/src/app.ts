import express from 'express';
import { connectDB, syncModels } from './config/database'; 
import router from './routes'; // This now works because of 'export default' above
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Using port 5001 as we discussed earlier
const PORT = process.env.PORT || 5001;

// Set up CORS 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Middleware setup
app.use(express.json()); 

// Attach Routes
app.use('/api', router); 

// Main setup function
async function startServer() {
    await connectDB();
    await syncModels(); 

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();