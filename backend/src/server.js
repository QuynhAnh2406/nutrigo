const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



// Setup routes
app.use('/api', routes);

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

// 404 for unknown API routes
app.use('/api', (_req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

// Generic error handler
app.use((err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});