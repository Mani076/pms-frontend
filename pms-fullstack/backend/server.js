const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3002; // Running on 3002 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
const db = new sqlite3.Database('./pms.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

// --- API ROUTES ---

// 1. [ADMIN REQUIREMENT] Aggregated Allocations
// Fetches Projects + Guides + Assigned Students in one go
app.get('/api/allocations', (req, res) => {
    const sql = `
        SELECT 
            P.project_id, P.project_name, P.status, P.guide_id,
            PG.first_name || ' ' || PG.last_name AS guide_name,
            S.student_id, S.first_name || ' ' || S.last_name AS student_name, S.email
        FROM Projects P
        LEFT JOIN ProjectGuides PG ON P.guide_id = PG.faculty_id
        LEFT JOIN ProjectAllocation PA ON P.project_id = PA.project_id
        LEFT JOIN Students S ON PA.student_id = S.student_id
        ORDER BY P.project_id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Aggregate Logic: Group multiple student rows into one project object
        const projects = {};
        rows.forEach(row => {
            if (!projects[row.project_id]) {
                projects[row.project_id] = {
                    project_id: row.project_id,
                    projectName: row.project_name,
                    status: row.status,
                    guideName: row.guide_name, // Guide Data
                    guideId: row.guide_id,
                    teamMembers: [] // Container for Students
                };
            }
            if (row.student_id) {
                projects[row.project_id].teamMembers.push({
                    id: row.student_id,
                    name: row.student_name,
                    email: row.email
                });
            }
        });
        res.json(Object.values(projects));
    });
});

// 2. [SKILLS REQUIREMENT] Student Profile + Skills
app.get('/api/student/:id', (req, res) => {
    const studentId = req.params.id;
    
    // Part A: Get Profile & Project Info
    const sqlProfile = `
        SELECT 
            S.first_name, S.last_name, S.email,
            P.project_name, P.description, P.status,
            PG.first_name AS guide_fn, PG.last_name AS guide_ln
        FROM Students S
        LEFT JOIN ProjectAllocation PA ON S.student_id = PA.student_id
        LEFT JOIN Projects P ON PA.project_id = P.project_id
        LEFT JOIN ProjectGuides PG ON P.guide_id = PG.faculty_id
        WHERE S.student_id = ?
    `;

    db.get(sqlProfile, [studentId], (err, studentRow) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!studentRow) return res.status(404).json({ error: "Student not found" });

        // Part B: Get Skills from Linking Table
        const sqlSkills = `
            SELECT SK.skill_name, SS.proficiency_level 
            FROM Student_Skills SS 
            JOIN Skills SK ON SS.skill_id = SK.skill_id 
            WHEREZS SS.student_id = ?
        `;
        
        db.all(sqlSkills, [studentId], (err, skillRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            res.json({
                profile: studentRow,
                skills: skillRows // Returns array of skills
            });
        });
    });
});

// 3. [HOD REQUIREMENT] Create Project
app.post('/api/projects', (req, res) => {
    const { name, description, guideId } = req.body;
    const sql = `INSERT INTO Projects (project_name, description, status, guide_id) VALUES (?, ?, 'Planned', ?)`;
    db.run(sql, [name, description, guideId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Project created", id: this.lastID });
    });
});

// 4. [ADMIN REQUIREMENT] Get/Add Students
app.get('/api/students', (req, res) => {
    db.all("SELECT * FROM Students", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/students', (req, res) => {
    const { firstName, lastName, email } = req.body;
    const sql = `INSERT INTO Students (first_name, last_name, email) VALUES (?, ?, ?)`;
    db.run(sql, [firstName, lastName, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});