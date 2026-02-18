
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    location TEXT NOT NULL,
    isAvailable INTEGER DEFAULT 1
  )`);

  // Added 'subject' column to table schema
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    roomId TEXT NOT NULL,
    studentName TEXT NOT NULL,
    studentNim TEXT NOT NULL,
    pdbClass TEXT NOT NULL,
    subject TEXT,
    contact TEXT,
    date TEXT NOT NULL,
    timeSlot TEXT NOT NULL,
    timestamp INTEGER,
    status TEXT DEFAULT 'APPROVED',
    aiMessage TEXT,
    FOREIGN KEY (roomId) REFERENCES rooms (id)
  )`);
}

// --- API ENDPOINTS ---

// Get All Rooms
app.get('/api/rooms', (req, res) => {
  db.all("SELECT * FROM rooms", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    // Convert isAvailable from 0/1 to boolean
    const rooms = rows.map(r => ({ ...r, isAvailable: !!r.isAvailable }));
    res.json(rooms);
  });
});

// Add Room
app.post('/api/rooms', (req, res) => {
  const { id, name, capacity, location, isAvailable } = req.body;
  const sql = "INSERT INTO rooms (id, name, capacity, location, isAvailable) VALUES (?,?,?,?,?)";
  const params = [id, name, capacity, location, isAvailable ? 1 : 0];
  
  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Room created", data: req.body });
  });
});

// Delete Room
app.delete('/api/rooms/:id', (req, res) => {
  const sql = "DELETE FROM rooms WHERE id = ?";
  db.run(sql, req.params.id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Room deleted", changes: this.changes });
  });
});

// Get All Bookings
app.get('/api/bookings', (req, res) => {
  const sql = `
    SELECT 
      b.*, 
      r.name as roomName, r.capacity as roomCapacity, r.location as roomLocation 
    FROM bookings b 
    JOIN rooms r ON b.roomId = r.id
    ORDER BY b.timestamp DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Transform flat SQL result to nested Object expected by frontend
    const bookings = rows.map(row => ({
      id: row.id,
      room: {
        id: row.roomId,
        name: row.roomName,
        capacity: row.roomCapacity,
        location: row.roomLocation,
        isAvailable: true
      },
      student: {
        name: row.studentName,
        nim: row.studentNim,
        pdbClass: row.pdbClass,
        subject: row.subject || '', // Handle legacy data that might not have subject
        contact: row.contact
      },
      date: row.date,
      timeSlot: row.timeSlot,
      timestamp: row.timestamp,
      status: row.status,
      aiMessage: row.aiMessage
    }));
    
    res.json(bookings);
  });
});

// Add Booking
app.post('/api/bookings', (req, res) => {
  const { id, room, student, date, timeSlot, timestamp, status, aiMessage } = req.body;
  
  // Added subject to INSERT statement
  const sql = `INSERT INTO bookings (
    id, roomId, studentName, studentNim, pdbClass, subject, contact, date, timeSlot, timestamp, status, aiMessage
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
  
  const params = [
    id, 
    room.id, 
    student.name, 
    student.nim, 
    student.pdbClass, 
    student.subject || '',
    student.contact || '', 
    date, 
    timeSlot, 
    timestamp, 
    status, 
    aiMessage
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Booking created", data: req.body });
  });
});

// Delete Booking
app.delete('/api/bookings/:id', (req, res) => {
  const sql = "DELETE FROM bookings WHERE id = ?";
  db.run(sql, req.params.id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Booking deleted", changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
