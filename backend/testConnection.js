const { Pool } = require('pg');
const dns = require('dns').promises;

async function test() {
  try {
    const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
    console.log(`Testing DNS resolution for ${host}...`);
    
    const addr4 = await dns.resolve4(host).catch(() => null);
    const addr6 = await dns.resolve6(host).catch(() => null);
    
    console.log('IPv4:', addr4);
    console.log('IPv6:', addr6);
    
    console.log('\nAttempting connection with pooler endpoint...');
    const pool = new Pool({
      host: host,
      port: 5432,
      user: 'postgres.okcvfpkxwizsejjkguih',
      password: 'NALigTZQ917',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    
    const client = await pool.connect();
    console.log('✅ Connected!');
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
