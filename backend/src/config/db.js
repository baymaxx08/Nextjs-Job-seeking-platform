const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;

function shouldUseSsl(connectionStringValue) {
  if (process.env.DATABASE_SSL === 'true') {
    return true;
  }

  try {
    const url = new URL(connectionStringValue);
    return !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

// In-memory mock database store (used when PostgreSQL is not connected)
const mockStore = {
  users: [
    {
      id: 1,
      email: 'provider@techcorp.io',
      password_hash: bcrypt.hashSync('Password123!', 10),
      role: 'provider',
      is_verified: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      email: 'alex.rivera@example.com',
      password_hash: bcrypt.hashSync('Password123!', 10),
      role: 'seeker',
      is_verified: true,
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  job_providers: [
    {
      id: 1,
      user_id: 1,
      company_name: 'TechFlow Systems',
      industry: 'Cloud & Developer Tooling',
      company_size: '50-200',
      description: 'Building modern cloud infrastructure, AI workflow orchestration, and developer productivity tools.',
      website: 'https://techflow.example.com',
      location: 'San Francisco, CA',
      logo_url: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop',
      founded_year: 2021,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  job_seekers: [
    {
      id: 1,
      user_id: 2,
      full_name: 'Alex Rivera',
      headline: 'Senior Full Stack & React Engineer',
      bio: 'Full stack developer with 6+ years experience architecting high-scale React, Node.js, and TypeScript applications.',
      location: 'Austin, TX',
      phone: '+1 (555) 234-5678',
      linkedin_url: 'https://linkedin.com',
      portfolio_url: 'https://github.com',
      years_of_experience: 6,
      availability: 'immediate',
      profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop',
      created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  skills: [
    { id: 1, name: 'React' },
    { id: 2, name: 'TypeScript' },
    { id: 3, name: 'Node.js' },
    { id: 4, name: 'Next.js' },
    { id: 5, name: 'PostgreSQL' },
    { id: 6, name: 'Tailwind CSS' },
    { id: 7, name: 'Python' },
    { id: 8, name: 'Docker' },
    { id: 9, name: 'Kubernetes' },
    { id: 10, name: 'GraphQL' },
    { id: 11, name: 'AWS' },
  ],
  seeker_skills: [
    { seeker_id: 1, skill_id: 1 },
    { seeker_id: 1, skill_id: 2 },
    { seeker_id: 1, skill_id: 3 },
    { seeker_id: 1, skill_id: 4 },
    { seeker_id: 1, skill_id: 5 },
  ],
  job_skills: [
    { job_id: 1, skill_id: 1 },
    { job_id: 1, skill_id: 2 },
    { job_id: 1, skill_id: 4 },
    { job_id: 2, skill_id: 1 },
    { job_id: 2, skill_id: 3 },
    { job_id: 2, skill_id: 5 },
    { job_id: 3, skill_id: 7 },
    { job_id: 3, skill_id: 8 },
    { job_id: 3, skill_id: 11 },
    { job_id: 4, skill_id: 1 },
    { job_id: 4, skill_id: 6 },
    { job_id: 5, skill_id: 8 },
    { job_id: 5, skill_id: 9 },
    { job_id: 5, skill_id: 11 },
    { job_id: 6, skill_id: 1 },
    { job_id: 6, skill_id: 6 },
  ],
  jobs: [
    {
      id: 1,
      provider_id: 1,
      title: 'Senior React & Next.js Architect',
      description: 'We are seeking an experienced Frontend Architect to lead UI performance, component design systems, and frontend platform scalability.',
      requirements: '5+ years React and TypeScript experience. Deep proficiency with Next.js, state management, and modern Web APIs.',
      responsibilities: 'Lead architecture of core web platforms, mentor junior developers, conduct design system reviews, and optimize Core Web Vitals.',
      location: 'San Francisco, CA',
      is_remote: true,
      job_type: 'full-time',
      salary_min: 140000,
      salary_max: 180000,
      currency: 'USD',
      experience_level: 'senior',
      status: 'open',
      application_deadline: '2026-12-31',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      provider_id: 1,
      title: 'Full Stack JavaScript Engineer',
      description: 'Join our product team to build high-performance services and intuitive user interfaces across our primary developer portal.',
      requirements: '3+ years experience with Node.js, Express/Fastify, React, and relational SQL databases.',
      responsibilities: 'Deliver end-to-end full stack features, integrate REST and GraphQL endpoints, and collaborate closely with product design.',
      location: 'Austin, TX',
      is_remote: false,
      job_type: 'full-time',
      salary_min: 110000,
      salary_max: 145000,
      currency: 'USD',
      experience_level: 'mid',
      status: 'open',
      application_deadline: '2026-11-30',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      provider_id: 1,
      title: 'AI Platform & Infrastructure Engineer',
      description: 'Build backend pipelines and low-latency inference endpoints supporting our machine learning workflows.',
      requirements: 'Experience with Python, Node.js, container orchestration (Docker/K8s), and cloud platforms.',
      responsibilities: 'Deploy resilient microservices, monitor model performance, and automate model deployment pipelines.',
      location: 'New York, NY',
      is_remote: true,
      job_type: 'full-time',
      salary_min: 155000,
      salary_max: 200000,
      currency: 'USD',
      experience_level: 'senior',
      status: 'open',
      application_deadline: '2026-12-15',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      provider_id: 1,
      title: 'Product UI/UX Engineer',
      description: 'Bridge design and engineering by building micro-interactions, responsive interfaces, and accessible design tokens.',
      requirements: 'Strong command of React, Tailwind CSS, animations, and WCAG accessibility standards.',
      responsibilities: 'Implement pixel-perfect user flows, conduct user testing, and improve web accessibility.',
      location: 'Seattle, WA',
      is_remote: true,
      job_type: 'contract',
      salary_min: 95000,
      salary_max: 130000,
      currency: 'USD',
      experience_level: 'mid',
      status: 'open',
      application_deadline: '2026-10-31',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 5,
      provider_id: 1,
      title: 'Cloud DevOps & SRE Specialist',
      description: 'Drive reliability, continuous integration, zero-downtime releases, and infrastructure as code.',
      requirements: 'Expertise in Docker, Kubernetes, Terraform, CI/CD pipelines, and cloud monitoring.',
      responsibilities: 'Manage cloud clusters, implement automated alerts, and ensure 99.99% uptime.',
      location: 'San Francisco, CA',
      is_remote: false,
      job_type: 'full-time',
      salary_min: 135000,
      salary_max: 175000,
      currency: 'USD',
      experience_level: 'senior',
      status: 'open',
      application_deadline: '2026-11-15',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 6,
      provider_id: 1,
      title: 'Junior Frontend Developer',
      description: 'Excellent entry point for motivated developers looking to build modern web applications under senior mentorship.',
      requirements: 'Foundational knowledge of HTML, CSS, JavaScript, and React basics.',
      responsibilities: 'Build UI components, fix reported bugs, write unit tests, and participate in code reviews.',
      location: 'Boston, MA',
      is_remote: false,
      job_type: 'internship',
      salary_min: 55000,
      salary_max: 75000,
      currency: 'USD',
      experience_level: 'entry',
      status: 'open',
      application_deadline: '2026-12-01',
      created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  resumes: [
    {
      id: 1,
      seeker_id: 2,
      file_name: 'Alex_Rivera_Resume_2026.pdf',
      file_path: 'uploads/resumes/2/Alex_Rivera_Resume_2026.pdf',
      file_size: 145000,
      is_default: true,
      uploaded_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  applications: [
    {
      id: 1,
      job_id: 1,
      seeker_id: 2,
      resume_id: 1,
      cover_letter: 'I have extensive experience with Next.js architecture and React performance optimization and would love to contribute to TechFlow.',
      status: 'shortlisted',
      applied_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  saved_jobs: [
    {
      id: 1,
      seeker_id: 2,
      job_id: 2,
      saved_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  notifications: [
    {
      id: 1,
      user_id: 2,
      type: 'application_status_updated',
      message: 'Your application for Senior React & Next.js Architect was shortlisted!',
      is_read: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      user_id: 1,
      type: 'new_application',
      message: 'New application received for Senior React & Next.js Architect from Alex Rivera',
      is_read: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  audit_logs: [],
};

let nextId = 100;

function executeMockQuery(sql, params = []) {
  const normalized = sql.trim();
  const lower = normalized.toLowerCase();

  // Transaction commands
  if (lower === 'begin' || lower === 'commit' || lower === 'rollback') {
    return { rows: [], rowCount: 0 };
  }

  // Users Queries
  if (lower.startsWith('select id from users where email = $1')) {
    const email = String(params[0]).toLowerCase();
    const user = mockStore.users.find((u) => u.email === email);
    return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
  }

  if (lower.startsWith('select id, email, password_hash, role, is_verified, created_at, updated_at from users where email = $1')) {
    const email = String(params[0]).toLowerCase();
    const user = mockStore.users.find((u) => u.email === email);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (lower.startsWith('insert into users')) {
    const [email, password_hash, role] = params;
    const newUser = {
      id: ++nextId,
      email: String(email).toLowerCase(),
      password_hash,
      role,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  if (lower.includes('from users u') && lower.includes('job_seekers js') && lower.includes("u.role = 'seeker'")) {
    const userId = Number(params[0]);
    const user = mockStore.users.find((u) => u.id === userId && u.role === 'seeker');
    if (!user) return { rows: [], rowCount: 0 };
    const seeker = mockStore.job_seekers.find((s) => s.user_id === userId) || {};
    const skillIds = mockStore.seeker_skills.filter((ss) => ss.seeker_id === seeker.id).map((ss) => ss.skill_id);
    const skillNames = mockStore.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);

    return {
      rows: [
        {
          id: user.id,
          user_id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
          full_name: seeker.full_name || '',
          headline: seeker.headline || '',
          bio: seeker.bio || '',
          location: seeker.location || '',
          phone: seeker.phone || '',
          linkedin_url: seeker.linkedin_url || '',
          portfolio_url: seeker.portfolio_url || '',
          years_of_experience: seeker.years_of_experience || 0,
          availability: seeker.availability || 'immediate',
          profile_photo_url: seeker.profile_photo_url || null,
          skills: skillNames,
        },
      ],
      rowCount: 1,
    };
  }

  if (lower.includes('from users u') && lower.includes('job_providers jp') && lower.includes("u.role = 'provider'")) {
    const userId = Number(params[0]);
    const user = mockStore.users.find((u) => u.id === userId && u.role === 'provider');
    if (!user) return { rows: [], rowCount: 0 };
    const provider = mockStore.job_providers.find((p) => p.user_id === userId) || {};
    return {
      rows: [
        {
          id: user.id,
          user_id: user.id,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
          company_name: provider.company_name || '',
          industry: provider.industry || '',
          company_size: provider.company_size || '',
          description: provider.description || '',
          website: provider.website || '',
          location: provider.location || '',
          logo_url: provider.logo_url || '',
          founded_year: provider.founded_year || null,
        },
      ],
      rowCount: 1,
    };
  }

  // Job Seekers Queries
  if (lower.startsWith('select id from job_seekers where user_id = $1')) {
    const userId = Number(params[0]);
    const seeker = mockStore.job_seekers.find((s) => s.user_id === userId);
    return { rows: seeker ? [{ id: seeker.id }] : [], rowCount: seeker ? 1 : 0 };
  }

  if (lower.startsWith('insert into job_seekers')) {
    const [user_id, full_name, headline, bio, location, phone, linkedin_url, portfolio_url, years_of_experience, availability] = params;
    const existing = mockStore.job_seekers.find((s) => s.user_id === Number(user_id));
    if (existing) {
      if (full_name) existing.full_name = full_name;
      existing.updated_at = new Date().toISOString();
      return { rows: [{ id: existing.id, ...existing }], rowCount: 1 };
    }
    const newSeeker = {
      id: ++nextId,
      user_id: Number(user_id),
      full_name: full_name || 'Job Seeker',
      headline: headline || null,
      bio: bio || null,
      location: location || null,
      phone: phone || null,
      linkedin_url: linkedin_url || null,
      portfolio_url: portfolio_url || null,
      years_of_experience: Number(years_of_experience || 0),
      availability: availability || 'immediate',
      profile_photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.job_seekers.push(newSeeker);
    return { rows: [newSeeker], rowCount: 1 };
  }

  if (lower.startsWith('update job_seekers')) {
    const userId = Number(params[9]);
    const seeker = mockStore.job_seekers.find((s) => s.user_id === userId);
    if (seeker) {
      if (params[0]) seeker.full_name = params[0];
      if (params[1]) seeker.headline = params[1];
      if (params[2]) seeker.bio = params[2];
      if (params[3]) seeker.location = params[3];
      if (params[4]) seeker.phone = params[4];
      if (params[5]) seeker.linkedin_url = params[5];
      if (params[6]) seeker.portfolio_url = params[6];
      if (params[7] !== null && params[7] !== undefined) seeker.years_of_experience = Number(params[7]);
      if (params[8]) seeker.availability = params[8];
      seeker.updated_at = new Date().toISOString();
      return { rows: [{ id: seeker.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Job Providers Queries
  if (lower.startsWith('insert into job_providers')) {
    const [user_id, company_name, industry, company_size, description, website, location, logo_url, founded_year] = params;
    const newProvider = {
      id: ++nextId,
      user_id: Number(user_id),
      company_name,
      industry,
      company_size,
      description,
      website,
      location,
      logo_url,
      founded_year: founded_year ? Number(founded_year) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.job_providers.push(newProvider);
    return { rows: [newProvider], rowCount: 1 };
  }

  if (lower.startsWith('select id from job_providers where user_id = $1')) {
    const userId = Number(params[0]);
    const provider = mockStore.job_providers.find((p) => p.user_id === userId);
    return { rows: provider ? [{ id: provider.id }] : [], rowCount: provider ? 1 : 0 };
  }

  if (lower.startsWith('select jp.id') && lower.includes('from job_providers jp') && lower.includes('where jp.user_id = $1')) {
    const userId = Number(params[0]);
    const provider = mockStore.job_providers.find((p) => p.user_id === userId);
    const user = mockStore.users.find((u) => u.id === userId) || {};
    if (!provider) return { rows: [], rowCount: 0 };
    return {
      rows: [
        {
          ...provider,
          email: user.email || '',
        },
      ],
      rowCount: 1,
    };
  }

  if (lower.startsWith('update job_providers')) {
    const providerId = Number(params[8]);
    const provider = mockStore.job_providers.find((p) => p.id === providerId);
    if (provider) {
      if (params[0]) provider.company_name = params[0];
      if (params[1] !== undefined) provider.industry = params[1];
      if (params[2] !== undefined) provider.company_size = params[2];
      if (params[3] !== undefined) provider.description = params[3];
      if (params[4] !== undefined) provider.website = params[4];
      if (params[5] !== undefined) provider.location = params[5];
      if (params[6] !== undefined) provider.logo_url = params[6];
      if (params[7] !== undefined) provider.founded_year = params[7] ? Number(params[7]) : null;
      provider.updated_at = new Date().toISOString();
      return { rows: [{ id: provider.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Jobs Queries
  if (lower.includes('count(*)::integer as total_count') && lower.includes('from jobs')) {
    const openJobs = mockStore.jobs.filter((j) => j.status === 'open');
    return { rows: [{ total_count: openJobs.length }], rowCount: 1 };
  }

  if (lower.includes('with job_rows as') || (lower.includes('select') && lower.includes('from jobs j') && lower.includes('order by j.created_at desc'))) {
    // Check if provider jobs query
    if (lower.includes('where j.provider_id = $1')) {
      const providerId = Number(params[0]);
      const providerJobs = mockStore.jobs.filter((j) => j.provider_id === providerId);
      const rows = providerJobs.map((j) => {
        const appCount = mockStore.applications.filter((a) => a.job_id === j.id).length;
        return {
          ...j,
          application_count: appCount,
        };
      });
      return { rows, rowCount: rows.length };
    }

    // Public jobs listings
    const rows = mockStore.jobs
      .filter((j) => j.status === 'open')
      .map((j) => {
        const provider = mockStore.job_providers.find((p) => p.id === j.provider_id) || {};
        const skillIds = mockStore.job_skills.filter((js) => js.job_id === j.id).map((js) => js.skill_id);
        const skills = mockStore.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);

        return {
          ...j,
          company_name: provider.company_name || 'Tech Company',
          industry: provider.industry || 'Technology',
          company_size: provider.company_size || '50-100',
          company_location: provider.location || j.location,
          logo_url: provider.logo_url || null,
          required_skill_count: skills.length,
          skills,
          total_count: mockStore.jobs.filter((x) => x.status === 'open').length,
        };
      });

    return { rows, rowCount: rows.length };
  }

  if (lower.includes('from jobs j') && lower.includes('where j.id = $1') && lower.includes('limit 1')) {
    const jobId = Number(params[0]);
    const job = mockStore.jobs.find((j) => j.id === jobId);
    if (!job) return { rows: [], rowCount: 0 };
    const provider = mockStore.job_providers.find((p) => p.id === job.provider_id) || {};
    const skillIds = mockStore.job_skills.filter((js) => js.job_id === job.id).map((js) => js.skill_id);
    const skills = mockStore.skills.filter((s) => skillIds.includes(s.id)).map((s) => s.name);
    const appCount = mockStore.applications.filter((a) => a.job_id === job.id).length;

    return {
      rows: [
        {
          ...job,
          company_name: provider.company_name || 'Tech Company',
          industry: provider.industry || 'Technology',
          company_size: provider.company_size || '50-100',
          company_description: provider.description || '',
          website: provider.website || '',
          company_location: provider.location || job.location,
          logo_url: provider.logo_url || null,
          founded_year: provider.founded_year || 2020,
          skills,
          application_count: appCount,
        },
      ],
      rowCount: 1,
    };
  }

  if (lower.startsWith('insert into jobs')) {
    const [
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
      status,
      application_deadline,
    ] = params;

    const newJob = {
      id: ++nextId,
      provider_id: Number(provider_id),
      title,
      description,
      requirements,
      responsibilities,
      location,
      is_remote: Boolean(is_remote),
      job_type,
      salary_min: salary_min ? Number(salary_min) : null,
      salary_max: salary_max ? Number(salary_max) : null,
      currency: currency || 'USD',
      experience_level,
      status: status || 'open',
      application_deadline: application_deadline || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.jobs.push(newJob);
    return { rows: [{ id: newJob.id }], rowCount: 1 };
  }

  if (lower.startsWith('update jobs')) {
    const jobId = Number(params[13]);
    const providerId = Number(params[14]);
    const job = mockStore.jobs.find((j) => j.id === jobId && j.provider_id === providerId);
    if (job) {
      job.title = params[0];
      job.description = params[1];
      job.requirements = params[2];
      job.responsibilities = params[3];
      job.location = params[4];
      job.is_remote = Boolean(params[5]);
      job.job_type = params[6];
      job.salary_min = params[7] ? Number(params[7]) : null;
      job.salary_max = params[8] ? Number(params[8]) : null;
      job.currency = params[9] || 'USD';
      job.experience_level = params[10];
      job.status = params[11] || 'open';
      job.application_deadline = params[12] || null;
      job.updated_at = new Date().toISOString();
      return { rows: [{ id: job.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.startsWith('delete from jobs')) {
    const jobId = Number(params[0]);
    const providerId = Number(params[1]);
    const idx = mockStore.jobs.findIndex((j) => j.id === jobId && j.provider_id === providerId);
    if (idx !== -1) {
      mockStore.jobs.splice(idx, 1);
      return { rows: [{ id: jobId }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Applications Queries
  if (lower.startsWith('select id from applications where job_id = $1 and seeker_id = $2')) {
    const jobId = Number(params[0]);
    const seekerId = Number(params[1]);
    const app = mockStore.applications.find((a) => a.job_id === jobId && a.seeker_id === seekerId);
    return { rows: app ? [{ id: app.id }] : [], rowCount: app ? 1 : 0 };
  }

  if (lower.startsWith('insert into applications')) {
    const [job_id, seeker_id, resume_id, cover_letter, status] = params;
    const newApp = {
      id: ++nextId,
      job_id: Number(job_id),
      seeker_id: Number(seeker_id),
      resume_id: resume_id ? Number(resume_id) : null,
      cover_letter: cover_letter || null,
      status: status || 'applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStore.applications.push(newApp);
    return { rows: [newApp], rowCount: 1 };
  }

  if (lower.includes('from applications a') && lower.includes('where a.seeker_id = $1')) {
    const seekerUserId = Number(params[0]);
    const seeker = mockStore.job_seekers.find((s) => s.user_id === seekerUserId) || { id: seekerUserId };
    const userApps = mockStore.applications.filter((a) => a.seeker_id === seekerUserId || a.seeker_id === seeker.id);

    const rows = userApps.map((a) => {
      const job = mockStore.jobs.find((j) => j.id === a.job_id) || {};
      const provider = mockStore.job_providers.find((p) => p.id === job.provider_id) || {};
      const resume = mockStore.resumes.find((r) => r.id === a.resume_id) || mockStore.resumes.find((r) => r.seeker_id === a.seeker_id) || {};

      return {
        id: a.id,
        job_id: a.job_id,
        seeker_id: a.seeker_id,
        resume_id: a.resume_id,
        cover_letter: a.cover_letter,
        status: a.status,
        applied_at: a.applied_at,
        updated_at: a.updated_at,
        title: job.title || 'Software Engineer',
        job_type: job.job_type || 'full-time',
        job_location: job.location || 'Remote',
        is_remote: job.is_remote ?? true,
        job_status: job.status || 'open',
        company_name: provider.company_name || 'Tech Company',
        resume_file_name: resume.file_name || 'resume.pdf',
        resume_file_path: resume.file_path || '',
      };
    });

    return { rows, rowCount: rows.length };
  }

  // Provider resume lookup for specific application
  if (lower.includes('from applications a') && lower.includes('inner join resumes r') && lower.includes('where a.id = $1 and j.provider_id = $2')) {
    const appId = Number(params[0]);
    const providerId = Number(params[1]);
    const app = mockStore.applications.find((a) => a.id === appId);
    if (!app) return { rows: [], rowCount: 0 };
    const job = mockStore.jobs.find((j) => j.id === app.job_id && j.provider_id === providerId);
    if (!job) return { rows: [], rowCount: 0 };
    const resume = mockStore.resumes.find((r) => r.id === app.resume_id) || mockStore.resumes.find((r) => r.seeker_id === app.seeker_id) || mockStore.resumes[0];
    if (resume) {
      return { rows: [{ file_name: resume.file_name, file_path: resume.file_path }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Provider applications list for specific job (listJobApplications)
  if (lower.includes('from applications a') && lower.includes('where a.job_id = $1 and j.provider_id = $2')) {
    const jobId = Number(params[0]);
    const providerId = Number(params[1]);
    const job = mockStore.jobs.find((j) => j.id === jobId && j.provider_id === providerId);
    if (!job) return { rows: [], rowCount: 0 };

    const apps = mockStore.applications.filter((a) => a.job_id === jobId);
    const jobSkillIds = mockStore.job_skills.filter((js) => js.job_id === jobId).map((js) => js.skill_id);
    const jobSkills = mockStore.skills.filter((s) => jobSkillIds.includes(s.id)).map((s) => s.name);

    const rows = apps.map((a) => {
      const seeker = mockStore.job_seekers.find((s) => s.user_id === a.seeker_id || s.id === a.seeker_id) || {};
      const user = mockStore.users.find((u) => u.id === a.seeker_id || u.id === seeker.user_id) || {};
      const resume = mockStore.resumes.find((r) => r.id === a.resume_id) || mockStore.resumes.find((r) => r.seeker_id === a.seeker_id || r.seeker_id === seeker.id) || {};
      const seekerSkillIds = mockStore.seeker_skills.filter((ss) => ss.seeker_id === seeker.id).map((ss) => ss.skill_id);
      const seekerSkills = mockStore.skills.filter((s) => seekerSkillIds.includes(s.id)).map((s) => s.name);

      return {
        id: a.id,
        job_id: a.job_id,
        seeker_id: a.seeker_id,
        resume_id: a.resume_id,
        cover_letter: a.cover_letter,
        status: a.status,
        applied_at: a.applied_at,
        updated_at: a.updated_at,
        seeker_email: user.email || 'candidate@example.com',
        full_name: seeker.full_name || 'Candidate',
        headline: seeker.headline || 'Software Engineer',
        location: seeker.location || 'Remote',
        years_of_experience: seeker.years_of_experience || 0,
        resume_file_name: resume.file_name || null,
        resume_file_path: resume.file_path || null,
        seeker_skills: seekerSkills,
        job_skills: jobSkills,
      };
    });

    return { rows, rowCount: rows.length };
  }

  // Provider applications list across all jobs
  if (lower.includes('from applications a') && lower.includes('where j.provider_id = $1')) {
    const providerId = Number(params[0]);
    const providerJobs = mockStore.jobs.filter((j) => j.provider_id === providerId);
    const providerJobIds = providerJobs.map((j) => j.id);
    const apps = mockStore.applications.filter((a) => providerJobIds.includes(a.job_id));

    const rows = apps.map((a) => {
      const job = providerJobs.find((j) => j.id === a.job_id) || {};
      const provider = mockStore.job_providers.find((p) => p.id === providerId) || {};
      const seeker = mockStore.job_seekers.find((s) => s.user_id === a.seeker_id || s.id === a.seeker_id) || {};
      const user = mockStore.users.find((u) => u.id === a.seeker_id || u.id === seeker.user_id) || {};
      const resume = mockStore.resumes.find((r) => r.id === a.resume_id) || mockStore.resumes.find((r) => r.seeker_id === a.seeker_id || r.seeker_id === seeker.id) || {};
      const seekerSkillIds = mockStore.seeker_skills.filter((ss) => ss.seeker_id === seeker.id).map((ss) => ss.skill_id);
      const seekerSkills = mockStore.skills.filter((s) => seekerSkillIds.includes(s.id)).map((s) => s.name);
      const jobSkillIds = mockStore.job_skills.filter((js) => js.job_id === job.id).map((js) => js.skill_id);
      const jobSkills = mockStore.skills.filter((s) => jobSkillIds.includes(s.id)).map((s) => s.name);

      return {
        id: a.id,
        job_id: a.job_id,
        seeker_id: a.seeker_id,
        resume_id: a.resume_id,
        cover_letter: a.cover_letter,
        status: a.status,
        applied_at: a.applied_at,
        updated_at: a.updated_at,
        title: job.title || 'Engineering Role',
        company_name: provider.company_name || 'TechFlow',
        seeker_email: user.email || 'candidate@example.com',
        full_name: seeker.full_name || 'Candidate',
        headline: seeker.headline || 'Software Engineer',
        location: seeker.location || 'Remote',
        years_of_experience: seeker.years_of_experience || 0,
        resume_file_name: resume.file_name || null,
        resume_file_path: resume.file_path || null,
        seeker_skills: seekerSkills,
        job_skills: jobSkills,
      };
    });

    return { rows, rowCount: rows.length };
  }

  if (lower.startsWith('update applications set status = $1 where id = $2')) {
    const status = params[0];
    const appId = Number(params[1]);
    const app = mockStore.applications.find((a) => a.id === appId);
    if (app) {
      app.status = status;
      app.updated_at = new Date().toISOString();
      return { rows: [{ id: app.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Saved Jobs Queries
  if (lower.includes('from saved_jobs sj') && lower.includes('where sj.seeker_id = $1')) {
    const seekerId = Number(params[0]);
    const saved = mockStore.saved_jobs.filter((s) => s.seeker_id === seekerId);
    const rows = saved.map((s) => {
      const job = mockStore.jobs.find((j) => j.id === s.job_id) || {};
      const provider = mockStore.job_providers.find((p) => p.id === job.provider_id) || {};
      return {
        id: s.id,
        saved_at: s.saved_at,
        job_id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        is_remote: job.is_remote,
        job_type: job.job_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        currency: job.currency,
        status: job.status,
        company_name: provider.company_name || 'Tech Company',
        logo_url: provider.logo_url || null,
      };
    });
    return { rows, rowCount: rows.length };
  }

  if (lower.startsWith('insert into saved_jobs')) {
    const [seeker_id, job_id] = params;
    const exists = mockStore.saved_jobs.some((s) => s.seeker_id === Number(seeker_id) && s.job_id === Number(job_id));
    if (!exists) {
      mockStore.saved_jobs.push({
        id: ++nextId,
        seeker_id: Number(seeker_id),
        job_id: Number(job_id),
        saved_at: new Date().toISOString(),
      });
    }
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('delete from saved_jobs where seeker_id = $1 and job_id = $2')) {
    const [seeker_id, job_id] = params;
    const idx = mockStore.saved_jobs.findIndex((s) => s.seeker_id === Number(seeker_id) && s.job_id === Number(job_id));
    if (idx !== -1) {
      mockStore.saved_jobs.splice(idx, 1);
    }
    return { rows: [], rowCount: 1 };
  }

  // Notifications Queries
  if (lower.includes('from notifications') && lower.includes('where user_id = $1')) {
    const userId = Number(params[0]);
    const notifs = mockStore.notifications.filter((n) => n.user_id === userId);
    return { rows: [...notifs].reverse(), rowCount: notifs.length };
  }

  if (lower.startsWith('update notifications set is_read = true where id = $1 and user_id = $2')) {
    const notifId = Number(params[0]);
    const userId = Number(params[1]);
    const notif = mockStore.notifications.find((n) => n.id === notifId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      return { rows: [{ id: notif.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.startsWith('update notifications set is_read = true where user_id = $1')) {
    const userId = Number(params[0]);
    mockStore.notifications.filter((n) => n.user_id === userId).forEach((n) => (n.is_read = true));
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('insert into notifications')) {
    const [user_id, type, message] = params;
    const newNotif = {
      id: ++nextId,
      user_id: Number(user_id),
      type,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    mockStore.notifications.push(newNotif);
    return { rows: [newNotif], rowCount: 1 };
  }

  // Resumes Queries
  if (lower.includes('count(*)') && lower.includes('from resumes')) {
    const seekerId = Number(params[0]);
    const onlyDefault = lower.includes('is_default = true');
    const total = mockStore.resumes.filter((r) => r.seeker_id === seekerId && (!onlyDefault || r.is_default)).length;
    return { rows: [{ total }], rowCount: 1 };
  }

  if (lower.includes('from resumes') && lower.includes('where id = $1 and seeker_id = $2')) {
    const resumeId = Number(params[0]);
    const seekerId = Number(params[1]);
    const resume = mockStore.resumes.find((r) => r.id === resumeId && (r.seeker_id === seekerId || mockStore.job_seekers.some((js) => js.user_id === seekerId && r.seeker_id === js.id)));
    return { rows: resume ? [resume] : [], rowCount: resume ? 1 : 0 };
  }

  if (lower.includes('from resumes') && lower.includes('where id = $1')) {
    const resumeId = Number(params[0]);
    const resume = mockStore.resumes.find((r) => r.id === resumeId);
    return { rows: resume ? [resume] : [], rowCount: resume ? 1 : 0 };
  }

  if (lower.includes('from resumes') && lower.includes('where seeker_id = $1')) {
    const seekerId = Number(params[0]);
    const userResumes = mockStore.resumes.filter((r) => r.seeker_id === seekerId || mockStore.job_seekers.some((js) => js.user_id === seekerId && r.seeker_id === js.id));
    return { rows: userResumes, rowCount: userResumes.length };
  }

  if (lower.startsWith('insert into resumes')) {
    const [seeker_id, file_name, file_path, file_size, is_default] = params;
    const newResume = {
      id: ++nextId,
      seeker_id: Number(seeker_id),
      file_name,
      file_path,
      file_size: Number(file_size),
      is_default: Boolean(is_default),
      uploaded_at: new Date().toISOString(),
    };
    mockStore.resumes.push(newResume);
    return { rows: [newResume], rowCount: 1 };
  }

  if (lower.startsWith('update resumes set is_default = false where seeker_id = $1')) {
    const seekerId = Number(params[0]);
    mockStore.resumes.filter((r) => r.seeker_id === seekerId || mockStore.job_seekers.some((js) => js.user_id === seekerId && r.seeker_id === js.id)).forEach((r) => (r.is_default = false));
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('update resumes set is_default = true where id = $1')) {
    const resumeId = Number(params[0]);
    const resume = mockStore.resumes.find((r) => r.id === resumeId);
    if (resume) {
      mockStore.resumes.filter((r) => r.seeker_id === resume.seeker_id).forEach((r) => (r.is_default = false));
      resume.is_default = true;
      return { rows: [{ id: resume.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.startsWith('delete from resumes where id = $1 and seeker_id = $2')) {
    const [resumeId, seekerId] = params;
    const idx = mockStore.resumes.findIndex((r) => r.id === Number(resumeId) && (r.seeker_id === Number(seekerId) || mockStore.job_seekers.some((js) => js.user_id === Number(seekerId) && r.seeker_id === js.id)));
    if (idx !== -1) mockStore.resumes.splice(idx, 1);
    return { rows: [], rowCount: 1 };
  }

  // Skills Queries
  if (lower.startsWith('insert into skills')) {
    const skillName = params[0];
    let skill = mockStore.skills.find((s) => s.name.toLowerCase() === String(skillName).toLowerCase());
    if (!skill) {
      skill = { id: ++nextId, name: skillName };
      mockStore.skills.push(skill);
    }
    return { rows: [{ id: skill.id }], rowCount: 1 };
  }

  if (lower.startsWith('delete from seeker_skills where seeker_id = $1')) {
    const seekerId = Number(params[0]);
    mockStore.seeker_skills = mockStore.seeker_skills.filter((ss) => ss.seeker_id !== seekerId);
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('delete from job_skills where job_id = $1')) {
    const jobId = Number(params[0]);
    mockStore.job_skills = mockStore.job_skills.filter((js) => js.job_id !== jobId);
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('insert into seeker_skills')) {
    const [seeker_id, skill_id] = params;
    mockStore.seeker_skills.push({ seeker_id: Number(seeker_id), skill_id: Number(skill_id) });
    return { rows: [], rowCount: 1 };
  }

  if (lower.startsWith('insert into job_skills')) {
    const [job_id, skill_id] = params;
    mockStore.job_skills.push({ job_id: Number(job_id), skill_id: Number(skill_id) });
    return { rows: [], rowCount: 1 };
  }

  // Audit Logs
  if (lower.startsWith('insert into audit_logs')) {
    const [actor_id, action, target_type, target_id] = params;
    mockStore.audit_logs.push({
      id: ++nextId,
      actor_id: Number(actor_id),
      action,
      target_type,
      target_id: Number(target_id),
      created_at: new Date().toISOString(),
    });
    return { rows: [], rowCount: 1 };
  }

  // Default fallback
  return { rows: [], rowCount: 0 };
}

let realPool = null;
if (connectionString) {
  try {
    realPool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      statement_timeout: 30000,
    });
  } catch (err) {
    console.warn('[AI Studio] PostgreSQL pool init failed, falling back to mock:', err.message);
  }
}

const INIT_SCHEMA_SQL = `
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('seeker', 'provider')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_seekers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  years_of_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  availability TEXT NOT NULL DEFAULT 'immediate' CHECK (availability IN ('immediate', '2weeks', '1month')),
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_providers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  description TEXT,
  website TEXT,
  location TEXT,
  logo_url TEXT,
  founded_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  provider_id BIGINT NOT NULL REFERENCES job_providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT,
  location TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min INTEGER CHECK (salary_min IS NULL OR salary_min >= 0),
  salary_max INTEGER CHECK (salary_max IS NULL OR salary_max >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  application_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resumes (
  id BIGSERIAL PRIMARY KEY,
  seeker_id BIGINT NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id BIGINT NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
  resume_id BIGINT REFERENCES resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interview', 'hired', 'rejected')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT applications_unique_job_seeker UNIQUE (job_id, seeker_id)
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id BIGSERIAL PRIMARY KEY,
  seeker_id BIGINT NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT saved_jobs_unique UNIQUE (seeker_id, job_id)
);

CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS seeker_skills (
  seeker_id BIGINT NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (seeker_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_skills (
  job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_job_seekers_user_id ON job_seekers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_providers_user_id ON job_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_provider_id ON jobs(provider_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_resumes_seeker_id ON resumes(seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_seeker_id ON applications(seeker_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_seeker_id ON saved_jobs(seeker_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

INSERT INTO skills (name) VALUES 
('React'), ('TypeScript'), ('Node.js'), ('Next.js'), ('PostgreSQL'), ('Tailwind CSS'), ('Python'), ('Docker'), ('Kubernetes'), ('GraphQL'), ('AWS')
ON CONFLICT (name) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at') THEN
    CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'job_seekers_set_updated_at') THEN
    CREATE TRIGGER job_seekers_set_updated_at BEFORE UPDATE ON job_seekers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'job_providers_set_updated_at') THEN
    CREATE TRIGGER job_providers_set_updated_at BEFORE UPDATE ON job_providers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'jobs_set_updated_at') THEN
    CREATE TRIGGER jobs_set_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'applications_set_updated_at') THEN
    CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
`;

let isInitialized = false;
let initPromise = null;

async function seedInitialData(client) {
  try {
    const passwordHash = bcrypt.hashSync('Password123!', 10);

    // 1. Seed Provider User if not exists
    const providerUserRes = await client.query(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ('provider@techcorp.io', $1, 'provider', TRUE)
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      [passwordHash]
    );

    let providerUserId = providerUserRes.rows[0]?.id;
    if (!providerUserId) {
      const existing = await client.query(`SELECT id FROM users WHERE email = 'provider@techcorp.io' LIMIT 1;`);
      providerUserId = existing.rows[0]?.id;
    }

    if (providerUserId) {
      const providerProfileRes = await client.query(
        `INSERT INTO job_providers (user_id, company_name, industry, company_size, description, website, location, logo_url, founded_year)
         VALUES ($1, 'TechFlow Systems', 'Cloud & Developer Tooling', '50-200', 'Building modern cloud infrastructure, AI workflow orchestration, and developer productivity tools.', 'https://techflow.example.com', 'San Francisco, CA', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop', 2021)
         ON CONFLICT (user_id) DO UPDATE SET company_name = EXCLUDED.company_name
         RETURNING id;`,
        [providerUserId]
      );
      const providerId = providerProfileRes.rows[0]?.id;

      // Seed Jobs if none exist
      if (providerId) {
        const jobsCount = await client.query(`SELECT COUNT(*)::int AS count FROM jobs;`);
        if (jobsCount.rows[0]?.count === 0) {
          const sampleJobs = [
            {
              title: 'Senior React & Next.js Architect',
              description: 'We are seeking an experienced Frontend Architect to lead UI performance, component design systems, and frontend platform scalability.',
              requirements: '5+ years React and TypeScript experience. Deep proficiency with Next.js, state management, and modern Web APIs.',
              responsibilities: 'Lead architecture of core web platforms, mentor junior developers, conduct design system reviews, and optimize Core Web Vitals.',
              location: 'San Francisco, CA',
              is_remote: true,
              job_type: 'full-time',
              salary_min: 140000,
              salary_max: 180000,
              experience_level: 'senior',
            },
            {
              title: 'Full Stack JavaScript Engineer',
              description: 'Join our product team to build high-performance services and intuitive user interfaces across our primary developer portal.',
              requirements: '3+ years experience with Node.js, Express/Fastify, React, and relational SQL databases.',
              responsibilities: 'Deliver end-to-end full stack features, integrate REST and GraphQL endpoints, and collaborate closely with product design.',
              location: 'Austin, TX',
              is_remote: false,
              job_type: 'full-time',
              salary_min: 110000,
              salary_max: 145000,
              experience_level: 'mid',
            },
            {
              title: 'Cloud Infrastructure & DevOps Engineer',
              description: 'Manage our multi-region Kubernetes clusters, CI/CD deployment pipelines, and cloud observability platforms.',
              requirements: 'Experience with Docker, Kubernetes, AWS/GCP, Terraform, and automated deployment pipelines.',
              responsibilities: 'Maintain 99.99% system availability, optimize infrastructure costs, and implement zero-downtime release pipelines.',
              location: 'Remote',
              is_remote: true,
              job_type: 'contract',
              salary_min: 130000,
              salary_max: 170000,
              experience_level: 'senior',
            },
            {
              title: 'Junior Frontend Developer',
              description: 'Great opportunity for an enthusiastic developer to build interactive dashboards and internal tooling with modern React.',
              requirements: 'Foundational knowledge of HTML, CSS, JavaScript/TypeScript, and React component workflows.',
              responsibilities: 'Build reusable UI components, fix responsive styling bugs, and collaborate with engineering teammates.',
              location: 'New York, NY',
              is_remote: false,
              job_type: 'full-time',
              salary_min: 75000,
              salary_max: 95000,
              experience_level: 'entry',
            },
          ];

          for (const job of sampleJobs) {
            await client.query(
              `INSERT INTO jobs (provider_id, title, description, requirements, responsibilities, location, is_remote, job_type, salary_min, salary_max, currency, experience_level, status, application_deadline)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'USD', $11, 'open', '2026-12-31');`,
              [
                providerId,
                job.title,
                job.description,
                job.requirements,
                job.responsibilities,
                job.location,
                job.is_remote,
                job.job_type,
                job.salary_min,
                job.salary_max,
                job.experience_level,
              ]
            );
          }
        }
      }
    }

    // 2. Seed Seeker User if not exists
    const seekerUserRes = await client.query(
      `INSERT INTO users (email, password_hash, role, is_verified)
       VALUES ('alex.rivera@example.com', $1, 'seeker', TRUE)
       ON CONFLICT (email) DO NOTHING
       RETURNING id;`,
      [passwordHash]
    );

    let seekerUserId = seekerUserRes.rows[0]?.id;
    if (!seekerUserId) {
      const existing = await client.query(`SELECT id FROM users WHERE email = 'alex.rivera@example.com' LIMIT 1;`);
      seekerUserId = existing.rows[0]?.id;
    }

    if (seekerUserId) {
      await client.query(
        `INSERT INTO job_seekers (user_id, full_name, headline, bio, location, phone, linkedin_url, portfolio_url, years_of_experience, availability, profile_photo_url)
         VALUES ($1, 'Alex Rivera', 'Senior Full Stack & React Engineer', 'Full stack developer with 6+ years experience architecting high-scale React, Node.js, and TypeScript applications.', 'Austin, TX', '+1 (555) 234-5678', 'https://linkedin.com', 'https://github.com', 6, 'immediate', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop')
         ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name;`,
        [seekerUserId]
      );
    }
  } catch (seedErr) {
    console.warn('[Database] Seed data check warning (safe to ignore if already populated):', seedErr.message);
  }
}

async function initDatabase() {
  if (isInitialized) return true;
  if (initPromise) return initPromise;

  if (!realPool) {
    console.log('[Database] No PostgreSQL DATABASE_URL detected. Running with in-memory store.');
    isInitialized = true;
    return true;
  }

  initPromise = (async () => {
    try {
      console.log('[Database] Connecting to PostgreSQL and verifying tables...');
      const client = await realPool.connect();
      try {
        await client.query(INIT_SCHEMA_SQL);
        console.log('✅ [Database] PostgreSQL tables and schema initialized successfully!');
        await seedInitialData(client);
        console.log('✅ [Database] Seed data verified and ready!');
        isInitialized = true;
        return true;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('❌ [Database] PostgreSQL schema migration failed:', err.message);
      console.warn('[Database] Falling back to mock store for transient requests until DB is ready.');
      return false;
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

const pool = {
  async connect() {
    if (realPool) {
      try {
        if (!isInitialized) {
          await initDatabase().catch(() => {});
        }
        const client = await realPool.connect();
        return client;
      } catch (err) {
        console.warn('[Database] PostgreSQL connection failed, switching to in-memory store:', err.message);
      }
    }

    return {
      async query(text, params) {
        return executeMockQuery(text, params);
      },
      release() {},
    };
  },

  async query(text, params) {
    if (realPool) {
      try {
        if (!isInitialized) {
          await initDatabase().catch(() => {});
        }
        return await realPool.query(text, params);
      } catch (err) {
        console.warn('[Database] PostgreSQL query failed, executing with in-memory store:', err.message);
      }
    }
    return executeMockQuery(text, params);
  },

  async end() {
    if (realPool) {
      await realPool.end();
    }
  },
};

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
  mockStore,
  initDatabase,
};
