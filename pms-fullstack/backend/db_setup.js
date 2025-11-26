const sqlite3 = require('sqlite3').verbose();

// Connect to (or create) the database file
const db = new sqlite3.Database('./pms.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite PMS database.');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // 1. Drop tables if they exist (to ensure a clean slate for testing)
        db.run("DROP TABLE IF EXISTS ProjectAllocation");
        db.run("DROP TABLE IF EXISTS Student_Skills");
        db.run("DROP TABLE IF EXISTS Skills");
        db.run("DROP TABLE IF EXISTS Students");
        db.run("DROP TABLE IF EXISTS Projects");
        db.run("DROP TABLE IF EXISTS ProjectGuides");

        // 2. Create Tables (DDL)
        
        // Faculty / Guides Table
        db.run(`CREATE TABLE ProjectGuides (
            faculty_id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )`);

        // Projects Table
        db.run(`CREATE TABLE Projects (
            project_id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'Planned',
            guide_id INTEGER,
            FOREIGN KEY (guide_id) REFERENCES ProjectGuides(faculty_id)
        )`);

        // Students Table
        db.run(`CREATE TABLE Students (
            student_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )`);

        // Skills Master List
        db.run(`CREATE TABLE Skills (
            skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
            skill_name TEXT UNIQUE NOT NULL
        )`);

        // Student Skills (Many-to-Many)
        db.run(`CREATE TABLE Student_Skills (
            student_id INTEGER,
            skill_id INTEGER,
            proficiency_level TEXT,
            PRIMARY KEY (student_id, skill_id),
            FOREIGN KEY (student_id) REFERENCES Students(student_id),
            FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
        )`);

        // Project Allocations
        db.run(`CREATE TABLE ProjectAllocation (
            proj_allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER,
            student_id INTEGER UNIQUE, -- A student can only have one project
            FOREIGN KEY (project_id) REFERENCES Projects(project_id),
            FOREIGN KEY (student_id) REFERENCES Students(student_id)
        )`);

        console.log("Tables created.");

        // 3. Insert Sample Data (DML)

        // Add Guides
        const stmtGuide = db.prepare("INSERT INTO ProjectGuides (faculty_id, first_name, last_name, email) VALUES (?, ?, ?, ?)");
        stmtGuide.run(501, 'Alice', 'Wong', 'alice@uni.edu');
        stmtGuide.run(502, 'Bob', 'Green', 'bob@uni.edu');
        stmtGuide.finalize();

        // Add Projects
        const stmtProj = db.prepare("INSERT INTO Projects (project_name, description, status, guide_id) VALUES (?, ?, ?, ?)");
        stmtProj.run('ML Data Analysis', 'Analyze COVID-19 trends using Python.', 'In Progress', 501);
        stmtProj.run('Library Management', 'Web app for library book tracking.', 'Planned', 502);
        stmtProj.finalize();

        // Add Students
        const stmtStu = db.prepare("INSERT INTO Students (first_name, last_name, email) VALUES (?, ?, ?)");
        stmtStu.run('John', 'Doe', 'john@uni.edu');
        stmtStu.run('Jane', 'Smith', 'jane@uni.edu');
        stmtStu.run('Mike', 'Ross', 'mike@uni.edu');
        stmtStu.finalize();

        // Add Skills
        const stmtSkill = db.prepare("INSERT INTO Skills (skill_name) VALUES (?)");
        stmtSkill.run('Python');
        stmtSkill.run('SQL');
        stmtSkill.run('React');
        stmtSkill.finalize();

        // Assign Skills to Students
        // John knows Python (Expert), Jane knows SQL (Intermediate)
        db.run("INSERT INTO Student_Skills (student_id, skill_id, proficiency_level) VALUES (1, 1, 'Expert')");
        db.run("INSERT INTO Student_Skills (student_id, skill_id, proficiency_level) VALUES (2, 2, 'Intermediate')");

        // Assign Students to Projects
        // John is on Project 1
        db.run("INSERT INTO ProjectAllocation (project_id, student_id) VALUES (1, 1)");

        console.log("Sample data inserted. Setup complete.");
    });
}