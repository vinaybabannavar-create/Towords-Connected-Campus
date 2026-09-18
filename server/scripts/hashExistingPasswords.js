import bcrypt from 'bcryptjs';
import { getDbPool } from '../db.js';

async function migratePasswords() {
  console.log('🔄 Starting password migration script...');
  let pool;
  try {
    pool = await getDbPool();
    const [rows] = await pool.query('SELECT bec, password FROM students');

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('ℹ️ No student records found in database.');
      process.exit(0);
    }

    let migratedCount = 0;
    let alreadyHashedCount = 0;

    for (const row of rows) {
      const { bec, password } = row;
      const isBcrypt = typeof password === 'string' && (
        password.startsWith('$2a$') ||
        password.startsWith('$2b$') ||
        password.startsWith('$2y$')
      );

      if (isBcrypt) {
        alreadyHashedCount++;
      } else {
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        await pool.query('UPDATE students SET password = ? WHERE bec = ?', [hashedPassword, bec]);
        migratedCount++;
        console.log(`✅ Hashed password for student/user: ${bec}`);
      }
    }

    console.log(`\n🎉 Password Migration Summary:`);
    console.log(`   - Total Accounts Checked: ${rows.length}`);
    console.log(`   - Newly Migrated / Hashed: ${migratedCount}`);
    console.log(`   - Already Bcrypt Hashed:   ${alreadyHashedCount}\n`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Password migration failed:', err.message);
    process.exit(1);
  }
}

migratePasswords();
