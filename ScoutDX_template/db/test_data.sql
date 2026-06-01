BEGIN;

-- =====================================
-- Master / Settings
-- =====================================
INSERT INTO NG_WORDS (ng_word_id, ng_word) VALUES
  (1, 'ブラック企業'),
  (2, '即日退職'),
  (3, 'ノルマ地獄')
ON CONFLICT (ng_word_id) DO NOTHING;

INSERT INTO MAX_TEXT_LENGTH (length_id, max_length) VALUES
  (1, 2000)
ON CONFLICT (length_id) DO NOTHING;

INSERT INTO JOB_TYPES (job_type_id, job_type_name) VALUES
  (1, 'Backend Engineer'),
  (2, 'Frontend Engineer'),
  (3, 'DevOps Engineer'),
  (4, 'Data Analyst')
ON CONFLICT (job_type_id) DO NOTHING;

INSERT INTO POSITIONS (position_id, position_name, created_at, updated_at) VALUES
  (1, 'Member', NOW(), NOW()),
  (2, 'Leader', NOW(), NOW()),
  (3, 'Manager', NOW(), NOW())
ON CONFLICT (position_id) DO NOTHING;

INSERT INTO RETURN_COMMENT_GENRES (genre_id, genre_name) VALUES
  (1, 'Tone and Politeness'),
  (2, 'Facts and Consistency'),
  (3, 'Compliance and Risk')
ON CONFLICT (genre_id) DO NOTHING;

INSERT INTO RETURN_COMMENT_GENRE_POSITIONS (genre_id, position_id) VALUES
  (1, 1),
  (1, 2),
  (2, 2),
  (2, 3),
  (3, 3)
ON CONFLICT (genre_id, position_id) DO NOTHING;

-- =====================================
-- Employees
-- =====================================
INSERT INTO EMPLOYEES (employee_id, name, password, position_id, created_at, updated_at) VALUES
  ('H0001', 'Taro Yamada', 'admin_001', 3, NOW(), NOW()),
  ('H0002', 'Hanako Sato', 'leader_001', 2, NOW(), NOW()),
  ('H0003', 'Ken Suzuki', 'member_001', 1, NOW(), NOW())
ON CONFLICT (employee_id) DO NOTHING;

-- =====================================
-- Job / Seeker domain
-- =====================================
INSERT INTO JOB_POSTINGS (
  job_posting_id,
  company_name,
  job_title,
  job_description,
  min_salary,
  max_salary,
  required_skills,
  job_appeal,
  work_location
) VALUES
  (
    1,
    'Acme Tech',
    'Backend Engineer (Go)',
    'Develop APIs and internal tools for B2B products.',
    5000000,
    8000000,
    'Go, PostgreSQL, Docker',
    'Remote-first team with strong mentorship culture.',
    'Tokyo / Remote'
  ),
  (
    2,
    'Blue Ocean Inc.',
    'Frontend Engineer (Vue)',
    'Build and maintain customer-facing web applications.',
    4500000,
    7000000,
    'Vue 3, TypeScript, Vitest',
    'Modern frontend stack and product-driven organization.',
    'Osaka'
  )
ON CONFLICT (job_posting_id) DO NOTHING;

INSERT INTO JOB_POSTINGS (
  job_posting_id,
  company_name,
  job_title,
  job_description,
  min_salary,
  max_salary,
  required_skills,
  job_appeal,
  work_location
) VALUES
  (
    3,
    'North Wind Systems',
    'DevOps Engineer (AWS)',
    'Improve CI/CD pipelines and cloud infrastructure reliability.',
    5500000,
    8500000,
    'AWS, Terraform, Kubernetes, GitHub Actions',
    'High-autonomy SRE culture with modern platform tooling.',
    'Yokohama / Hybrid'
  ),
  (
    4,
    'Insight Works',
    'Data Analyst',
    'Analyze product and marketing data, design KPI dashboards, and improve decision making.',
    4800000,
    7200000,
    'SQL, Python, BI tools, Statistical analysis',
    'Work closely with product managers and business stakeholders.',
    'Nagoya'
  )
ON CONFLICT (job_posting_id) DO NOTHING;

INSERT INTO JOB_POSTING_JOB_TYPES (job_posting_id, job_type_id) VALUES
  (1, 1),
  (1, 3),
  (2, 2),
  (3, 3),
  (4, 4)
ON CONFLICT (job_posting_id, job_type_id) DO NOTHING;

INSERT INTO JOB_SEEKERS (job_seeker_id, age, gender, desired_position, created_at, updated_at) VALUES
  (1, 28, 'male', 'Backend Engineer', NOW(), NOW()),
  (2, 31, 'female', 'Frontend Engineer', NOW(), NOW()),
  (3, 26, 'other', 'Data Analyst', NOW(), NOW()),
  (4, 34, 'male', 'DevOps Engineer', NOW(), NOW()),
  (5, 29, 'female', 'Data Analyst', NOW(), NOW())
ON CONFLICT (job_seeker_id) DO NOTHING;

INSERT INTO JOB_SEEKER_JOB_TYPES (job_seeker_id, job_type_id) VALUES
  (1, 1),
  (1, 3),
  (2, 2),
  (3, 4),
  (4, 3),
  (5, 4)
ON CONFLICT (job_seeker_id, job_type_id) DO NOTHING;

-- =====================================
-- Scout messages / histories
-- =====================================
INSERT INTO SCOUT_MESSAGES (
  scout_message_id,
  message_content,
  sent_at,
  job_posting_id,
  job_seeker_id,
  created_by_employee_id,
  updated_by_employee_id,
  status,
  created_at,
  updated_at
) VALUES
  (
    1,
    'Your backend experience matches our API platform team. We would love to talk.',
    NOW(),
    1,
    1,
    'H0002',
    'H0002',
    'SENT',
    NOW(),
    NOW()
  ),
  (
    2,
    'Your Vue experience is a great fit for our product frontend roadmap.',
    NOW(),
    2,
    2,
    'H0003',
    'H0003',
    'DRAFT',
    NOW(),
    NOW()
  )
ON CONFLICT (scout_message_id) DO NOTHING;

INSERT INTO SCOUT_MESSAGES (
  scout_message_id,
  message_content,
  sent_at,
  job_posting_id,
  job_seeker_id,
  created_by_employee_id,
  updated_by_employee_id,
  status,
  created_at,
  updated_at
) VALUES
  (
    6,
    'Your DevOps experience is well aligned with our platform modernization initiative.',
    NULL,
    3,
    4,
    'H0003',
    'H0003',
    'PENDING_APPROVER',
    NOW(),
    NOW()
  ),
  (
    7,
    'Your analytics background matches our data-driven product team needs.',
    NULL,
    4,
    5,
    'H0003',
    'H0002',
    'REJECTED_BY_APPROVER',
    NOW(),
    NOW()
  ),
  (
    8,
    'We believe your backend architecture skills would be a strong fit for our API team.',
    NOW(),
    1,
    1,
    'H0003',
    'H0001',
    'AVAILABLE',
    NOW(),
    NOW()
  ),
  (
    9,
    'Your profile strongly matches our growth-stage frontend platform role and we would like to proceed to final review.',
    NULL,
    2,
    2,
    'H0003',
    'H0002',
    'PENDING_ADMIN',
    NOW(),
    NOW()
  )
ON CONFLICT (scout_message_id) DO NOTHING;

INSERT INTO SCOUT_MESSAGE_HISTORIES (
  scout_message_history_id,
  scout_message_id,
  message_content,
  return_comment,
  returned_by_employee_id,
  returned_at,
  sent_at
) VALUES
  (
    1,
    1,
    'Your backend experience matches our API platform team. We would love to talk.',
    'Looks good overall, but clarify project scope and expected responsibilities.',
    'H0001',
    NOW(),
    NOW()
  ),
  (
    2,
    2,
    'Your Vue experience is a great fit for our product frontend roadmap.',
    'Please make the tone more specific and less generic.',
    'H0002',
    NOW(),
    NOW()
  )
ON CONFLICT (scout_message_history_id) DO NOTHING;

INSERT INTO SCOUT_MESSAGE_HISTORIES (
  scout_message_history_id,
  scout_message_id,
  message_content,
  return_comment,
  returned_by_employee_id,
  returned_at,
  sent_at
) VALUES
  (
    5,
    6,
    'Your DevOps experience is well aligned with our platform modernization initiative.',
    'Please add concrete ownership scope and expected on-call responsibilities.',
    'H0002',
    NOW(),
    NULL
  ),
  (
    6,
    7,
    'Your analytics background matches our data-driven product team needs.',
    'Clarify measurable outcomes and avoid generic wording.',
    'H0002',
    NOW(),
    NULL
  )
ON CONFLICT (scout_message_history_id) DO NOTHING;

INSERT INTO RETURN_COMMENT_HISTORY_GENRES (scout_message_history_id, genre_id) VALUES
  (1, 2),
  (2, 1),
  (5, 2),
  (6, 1)
ON CONFLICT (scout_message_history_id, genre_id) DO NOTHING;

COMMIT;
