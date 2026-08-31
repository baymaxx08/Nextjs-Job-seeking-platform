const path = require('path');

// Load .env first
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { pool } = require('./src/config/db');

async function seedTestData() {
  const client = await pool.connect();

  try {
    console.log('Seeding test data...');

    // Get first provider
    const providerResult = await client.query(`
      SELECT jp.id FROM job_providers jp LIMIT 1
    `);

    if (providerResult.rows.length === 0) {
      console.error('No provider found. Please register a provider first.');
      return;
    }

    const providerId = providerResult.rows[0].id;
    console.log('Using provider ID:', providerId);

    // Insert a test job
    const jobResult = await client.query(`
      INSERT INTO jobs (
        provider_id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        is_remote,
        job_type,
        salary_min,
        salary_max,
        currency,
        experience_level,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title
    `,
      [
        providerId,
        'Senior React Developer',
        'We are looking for an experienced React developer to join our team. You will work on building scalable, high-performance web applications using modern JavaScript and React.',
        'Your must have: 5+ years of React experience, strong TypeScript knowledge, experience with Next.js, Node.js backend understanding, PostgreSQL basics. Nice to have: GraphQL, Docker, CI/CD experience.',
        'Design and implement React components. Work with REST/GraphQL APIs. Participate in code reviews. Mentor junior developers. Optimize application performance.',
        'San Francisco, CA',
        false,
        'full-time',
        120000,
        160000,
        'USD',
        'senior',
        'open'
      ]
    );

    const jobId = jobResult.rows[0].id;
    console.log('✅ Test job created with ID:', jobId);

    // Insert another test job
    const job2Result = await client.query(`
      INSERT INTO jobs (
        provider_id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        is_remote,
        job_type,
        salary_min,
        salary_max,
        currency,
        experience_level,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title
    `,
      [
        providerId,
        'Full Stack JavaScript Developer',
        'Join our innovative startup building cutting-edge web applications. We are looking for a talented full-stack developer to help us scale our platform.',
        'Required: 3+ years JavaScript/TypeScript, React or Vue.js, Node.js, PostgreSQL or MongoDB, Git. Preferred: AWS/GCP, Docker, Redis, testing frameworks.',
        'Develop full-stack features. Write clean, maintainable code. Participate in architecture discussions. Collaborate with product team.',
        'Remote',
        true,
        'full-time',
        80000,
        120000,
        'USD',
        'mid',
        'open'
      ]
    );

    console.log('✅ Second test job created with ID:', job2Result.rows[0].id);

    // Insert a third test job
    const job3Result = await client.query(`
      INSERT INTO jobs (
        provider_id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        is_remote,
        job_type,
        salary_min,
        salary_max,
        currency,
        experience_level,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title
    `,
      [
        providerId,
        'Junior Web Developer',
        'Great opportunity for junior developers to grow their skills. We provide mentorship and training in a supportive environment.',
        'Beginner-friendly: HTML, CSS, JavaScript basics, willingness to learn, problem-solving mindset. Nice to have: Git experience, any framework knowledge.',
        'Build responsive web pages. Fix bugs. Assist senior developers. Learn best practices. Contribute to documentation.',
        'Austin, TX',
        false,
        'full-time',
        45000,
        65000,
        'USD',
        'entry',
        'open'
      ]
    );

    console.log('✅ Third test job created with ID:', job3Result.rows[0].id);

    console.log('\n✅ Test data seeded successfully!');
    console.log('Check the jobs page to see the posted jobs.');
  } catch (error) {
    console.error('❌ Error seeding test data:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTestData();
