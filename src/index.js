import express from 'express';
import { matchRouter } from './routes/matches.js';


const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Root GET route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Sportz API!' });
});

// Import and use match routes
app.use('/matches', matchRouter);
// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
