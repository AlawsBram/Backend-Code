const express = require('express');
const multer = require('multer');
const odbc = require('odbc');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Allow frontend to access the backend
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Connect to Microsoft Access Database
const dbPath = process.env.DB_PATH;
const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)};Dbq=${dbPath};`;

async function insertIntoDatabase(filename, eventType, eventDate) {
    try {
        const connection = await odbc.connect(connectionString);
        await connection.query(`INSERT INTO Events (FileName, EventType, EventDate) VALUES ('${filename}', '${eventType}', '${eventDate}')`);
        await connection.close();
    } catch (error) {
        console.error("Database Error:", error);
    }
}

// Upload file API
app.post('/upload', upload.single('file'), async (req, res) => {
    const { eventType, eventDate } = req.body;
    const filename = req.file.filename;

    // Save data to Microsoft Access
    await insertIntoDatabase(filename, eventType, eventDate);

    res.json({ message: "File uploaded and saved to database!" });
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
