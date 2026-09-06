import mysql from 'mysql2/promise';

const tidbHost = process.env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com';
const tidbPort = Number(process.env.TIDB_PORT) || 4000;
const tidbUser = process.env.TIDB_USER || 'ccdjxcTfxpVGx5J.root';
const tidbPassword = process.env.TIDB_PASSWORD || 'FSU5fgIbgW7S0oyv';
const tidbDatabase = process.env.TIDB_DATABASE || 'bec_portal';

let pool = null;
let initPromise = null;

export const getDbPool = async () => {
  if (!pool) {
    pool = mysql.createPool({
      host: tidbHost,
      port: tidbPort,
      user: tidbUser,
      password: tidbPassword,
      database: tidbDatabase,
      waitForConnections: true,
      connectionLimit: 15,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: { rejectUnauthorized: false }
    });
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // 1. Students / Staff accounts
        await pool.query(`
          CREATE TABLE IF NOT EXISTS students (
            bec VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            department VARCHAR(100) NOT NULL,
            year VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        try {
          await pool.query("ALTER TABLE students ADD COLUMN role VARCHAR(50) DEFAULT 'student';");
        } catch (e) {}

        // 2. Projects
        await pool.query(`
          CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(100) PRIMARY KEY,
            bec VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            guide VARCHAR(255),
            phase VARCHAR(100),
            progress INT,
            problem TEXT,
            stack JSON,
            repo_url TEXT,
            folders JSON,
            explanation JSON,
            ai_review LONGTEXT,
            features JSON,
            special TEXT,
            milestones JSON,
            created_at VARCHAR(100)
          );
        `);

        // 3. Gate Passes
        await pool.query(`
          CREATE TABLE IF NOT EXISTS gate_passes (
            id VARCHAR(100) PRIMARY KEY,
            bec VARCHAR(50) NOT NULL,
            name VARCHAR(255) NOT NULL,
            roll_no VARCHAR(50),
            branch VARCHAR(100),
            year_sem VARCHAR(100),
            college_name VARCHAR(255),
            department VARCHAR(100),
            reason TEXT,
            document_name VARCHAR(255),
            ai_priority VARCHAR(50) DEFAULT 'MEDIUM',
            security_key VARCHAR(50),
            date VARCHAR(50),
            out_time VARCHAR(50),
            return_time VARCHAR(50),
            contact VARCHAR(50),
            status VARCHAR(100),
            teacher_approval VARCHAR(255),
            hod_approval VARCHAR(255),
            rejection_reason TEXT,
            created_at VARCHAR(100)
          );
        `);

        // 4. Placement Drives
        await pool.query(`
          CREATE TABLE IF NOT EXISTS placement_drives (
            id VARCHAR(100) PRIMARY KEY,
            company VARCHAR(255) NOT NULL,
            domain VARCHAR(255),
            role VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            salary VARCHAR(255),
            skills TEXT,
            min_cgpa VARCHAR(50),
            branches JSON,
            drive_date VARCHAR(50),
            deadline VARCHAR(50),
            description TEXT,
            pdf_url LONGTEXT,
            pdf_name VARCHAR(255),
            status VARCHAR(50) DEFAULT 'Active',
            posted_by VARCHAR(255),
            created_at VARCHAR(100)
          );
        `);

        // 5. Placement Registrations
        await pool.query(`
          CREATE TABLE IF NOT EXISTS placement_registrations (
            id VARCHAR(100) PRIMARY KEY,
            drive_id VARCHAR(100) NOT NULL,
            student_bec VARCHAR(50) NOT NULL,
            student_name VARCHAR(255) NOT NULL,
            department VARCHAR(100),
            year VARCHAR(50),
            cgpa VARCHAR(50),
            phone VARCHAR(50),
            email VARCHAR(255),
            skills TEXT,
            resume_url LONGTEXT,
            resume_name VARCHAR(255),
            registered_at VARCHAR(100)
          );
        `);

        console.log('✅ Express Backend: TiDB Cloud Database pool initialized and ready');
      } catch (err) {
        console.error('⚠️ Express Backend TiDB init notice:', err.message);
      }
    })();
  }

  await initPromise;
  return pool;
};
