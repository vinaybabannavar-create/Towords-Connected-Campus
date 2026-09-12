import mysql from 'mysql2/promise';

const tidbHost = process.env.TIDB_HOST;
const tidbPort = Number(process.env.TIDB_PORT) || 4000;
const tidbUser = process.env.TIDB_USER;
const tidbPassword = process.env.TIDB_PASSWORD;
const tidbDatabase = process.env.TIDB_DATABASE || 'bec_portal';

let pool = null;
let initDone = false;

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
      keepAliveInitialDelay: 5000,
      connectTimeout: 15000,
      ssl: { rejectUnauthorized: false }
    });

    // Run table initializations asynchronously in background so queries are NEVER blocked
    if (!initDone) {
      initDone = true;
      runMigrations(pool).catch((err) => {
        console.warn('⚠️ TiDB background migration notice:', err.message);
      });
    }
  }

  return pool;
};

// Resilient query execution with automatic retry for transient network timeouts / disconnects
export const executeQuery = async (sql, params = [], retries = 2) => {
  const currentPool = await getDbPool();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await currentPool.query(sql, params);
    } catch (err) {
      const isTransient =
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNRESET' ||
        err.code === 'PROTOCOL_CONNECTION_LOST' ||
        err.code === 'EAI_AGAIN' ||
        err.message?.includes('ETIMEDOUT') ||
        err.message?.includes('ECONNRESET');

      if (attempt < retries && isTransient) {
        console.warn(`⚠️ TiDB query transient error (${err.message}). Retrying ${attempt + 1}/${retries}...`);
        await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
};

const runMigrations = async (dbPool) => {
  try {
    // 1. Students / Staff accounts
    await dbPool.query(`
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
      await dbPool.query("ALTER TABLE students ADD COLUMN role VARCHAR(50) DEFAULT 'student';");
    } catch (e) {}

    // 2. Projects
    await dbPool.query(`
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
    await dbPool.query(`
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
    await dbPool.query(`
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
    await dbPool.query(`
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
};
