const postgres = require('postgres');

async function createDatabase() {
  // Connect to the default postgres database
  const sql = postgres('postgresql://budget:budget123@193.168.195.222:5432/postgres');

  try {
    await sql`CREATE DATABASE dream_journal`;
    console.log('✓ Database dream_journal created successfully');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('✓ Database dream_journal already exists');
    } else {
      console.error('✗ Error creating database:', err.message);
      process.exit(1);
    }
  } finally {
    await sql.end();
  }
}

createDatabase();
