import express from 'express';
import routes from "./routes";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from 'express-fileupload';
import morgan from "morgan"; // 📌 Added morgan
import './utils/database'; // Import database to ensure initialization
// import { poolMonitor } from './utils/pooling'; // Pool monitoring disabled

import apiResponse from './utils/apiResponse';
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], // Allow specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
  allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Allow specific headers
  optionsSuccessStatus: 200 // For legacy browser support
};

const app = express();
const port = 8888;
app.use(cors(corsOptions));
app.use(express.json());
dotenv.config();
app.use(apiResponse);
app.use(fileUpload());
app.use(morgan("dev"));
// 📌 Use morgan for logging HTTP requests


app.use('/api', routes);
app.get('/', (req, res) => {
  res.send('Welcome to you');
});

app.listen(port, () => {
  console.log(`🚀 Server started at http://localhost:${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/api/health/health`);
  
  // Pool monitoring disabled - not required for this application
  // setTimeout(() => {
  //   poolMonitor.startMonitoring(30000);
  // }, 5000);
});