const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import cors

const app = express();

app.use(cors());  // Enable CORS for all routes


app.use(bodyParser.json()); // Middleware to parse JSON body

// Define the route for prediction
app.post('/predict', (req, res) => {
    const { state, market, commodity } = req.body;

    if (!state || !market || !commodity) {
        return res.status(400).json({ error: 'Missing query parameters: state, market, and commodity are required.' });
    }

    const entity = `${state} | ${market} | ${commodity}`;
    console.log(`Entity received: ${entity}`);

    // Use exec to run the Python script
    exec(`python model2.py "${entity}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).json({ error: 'Error executing the prediction model.' });
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'Error in Python script execution.' });
        }

        console.log(`Python script output: ${stdout}`);  // Log the output from Python for debugging
        
        try {
            const predictions = JSON.parse(stdout.trim());  // Ensure only JSON is parsed
            res.json({ forecasted_prices:predictions });
        } catch (parseError) {
            console.error('Error parsing Python output:', parseError);
            res.status(500).json({ error: 'Error parsing the prediction result.' });
        }
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
