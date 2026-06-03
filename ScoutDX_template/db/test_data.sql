BEGIN;

-- =====================================
-- Master / Settings
-- =====================================
INSERT INTO NG_WORDS (ng_word_id, ng_word) VALUES
  (1, '必ず'),
  (2, '絶対に'),
  (3, '誰でも'),
  (4, '簡単に'),
  (5, '確実に'),
  (6, '今だけ'),
  (7, '早い者勝ち'),
  (8, '限定'),
  (9, '日本人限定'),
  (10, '外国人NG'),
  (11, '女性限定'),
  (12, '男性歓迎'),
  (13, '既婚者歓迎'),
  (14, '若手限定'),
  (15, '高収入保証')
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
  (1, '求人：人・事実との整合性がない'),
  (2, '表現が不正確・不適切'),
  (3, '情報の過不足・文章構造'),
  (4, '表現リスク（誇張・断定・誤認）'),
  (5, 'クレームリスク・情報不足による誤認リスク'),
  (6, '誤字脱字'),
  (7, '魅力が伝わっていない'),
  (8, 'ターゲット不適合'),
  (9, '構成（ストーリー）が弱い'),
  (10, '興味喚起が弱い'),
  (11, 'ジェネラライズできていない'),
  (12, '視認性が低い・一文が長すぎる'),
  (13, '法令・コンプライアンス違反'),
  (14, '事実根拠不明'),
  (15, '企業イメージ毀損'),
  (16, 'クレームリスク（対候補者・対企業）')
ON CONFLICT (genre_id) DO NOTHING;

INSERT INTO RETURN_COMMENT_GENRE_POSITIONS (genre_id, position_id) VALUES
  (1, 2),
  (1, 3),
  (2, 2),
  (2, 3),
  (3, 2),
  (3, 3),
  (4, 2),
  (4, 3),
  (5, 2),
  (5, 3),
  (6, 2),
  (6, 3),
  (7, 2),
  (8, 2),
  (9, 2),
  (10, 2),
  (11, 2),
  (12, 2),
  (13, 3),
  (14, 3),
  (15, 3),
  (16, 3)
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

INSERT INTO JOB_SEEKERS (job_seeker_id, age, gender, created_at, updated_at) VALUES
  (1, 28, 'male', NOW(), NOW()),
  (2, 31, 'female', NOW(), NOW()),
  (3, 26, 'other', NOW(), NOW()),
  (4, 34, 'male', NOW(), NOW()),
  (5, 29, 'female', NOW(), NOW())
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
    'H0003',
    'H0001',
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

-- =====================================
-- Additional employees for richer test scenarios
-- (creator must be Member role only)
-- =====================================
INSERT INTO EMPLOYEES (employee_id, name, password, position_id, created_at, updated_at) VALUES
  ('H0004', 'Mei Tanaka', 'member_002', 1, NOW() - INTERVAL '120 days', NOW() - INTERVAL '2 days'),
  ('H0005', 'Riku Ito', 'member_003', 1, NOW() - INTERVAL '95 days', NOW() - INTERVAL '1 days'),
  ('H0006', 'Aoi Kato', 'leader_002', 2, NOW() - INTERVAL '130 days', NOW() - INTERVAL '3 days'),
  ('H0007', 'Sora Nakamura', 'manager_002', 3, NOW() - INTERVAL '140 days', NOW() - INTERVAL '4 days')
ON CONFLICT (employee_id) DO NOTHING;

-- =====================================
-- Additional job postings / seekers with varied timestamps
-- =====================================
INSERT INTO JOB_POSTINGS (
  job_posting_id,
  company_name,
  job_description,
  min_salary,
  max_salary,
  required_skills,
  job_appeal,
  work_location
) VALUES
  (
    10,
    'Cedar Labs',
    'Build internal platforms and improve service reliability.',
    6200000,
    9000000,
    'Go, Kubernetes, Terraform',
    'Product scale phase with strong ownership opportunities.',
    'Tokyo / Hybrid'
  ),
  (
    11,
    'Orbit Commerce',
    'Develop customer-facing storefront and internal CMS.',
    5000000,
    7600000,
    'Vue 3, TypeScript, Pinia',
    'Fast release cycle with direct product feedback loop.',
    'Osaka / Remote'
  ),
  (
    12,
    'River Analytics',
    'Design and operate data pipelines for analytics and ML.',
    5800000,
    8200000,
    'Python, SQL, Airflow',
    'Data platform greenfield project.',
    'Fukuoka'
  ),
  (
    13,
    'Lighthouse Security',
    'Lead secure SDLC and cloud security improvements.',
    6500000,
    9800000,
    'AWS, SIEM, Threat Modeling',
    'Cross-functional influence and incident response ownership.',
    'Yokohama / Hybrid'
  )
ON CONFLICT (job_posting_id) DO NOTHING;

INSERT INTO JOB_POSTING_JOB_TYPES (job_posting_id, job_type_id) VALUES
  (10, 1),
  (10, 3),
  (11, 2),
  (12, 4),
  (13, 3)
ON CONFLICT (job_posting_id, job_type_id) DO NOTHING;

INSERT INTO JOB_SEEKERS (job_seeker_id, age, gender, created_at, updated_at) VALUES
  (10, 24, 'female', NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days'),
  (11, 27, 'male', NOW() - INTERVAL '75 days', NOW() - INTERVAL '6 days'),
  (12, 33, 'female', NOW() - INTERVAL '55 days', NOW() - INTERVAL '4 days'),
  (13, 38, 'male', NOW() - INTERVAL '85 days', NOW() - INTERVAL '9 days'),
  (14, 29, 'other', NOW() - INTERVAL '65 days', NOW() - INTERVAL '2 days'),
  (15, 41, 'female', NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days')
ON CONFLICT (job_seeker_id) DO NOTHING;

INSERT INTO JOB_SEEKER_JOB_TYPES (job_seeker_id, job_type_id) VALUES
  (10, 2),
  (11, 1),
  (11, 3),
  (12, 4),
  (13, 3),
  (14, 1),
  (15, 3)
ON CONFLICT (job_seeker_id, job_type_id) DO NOTHING;

-- =====================================
-- Additional scout messages
-- created_by_employee_id is Member only: H0003/H0004/H0005
-- Includes multiple records older than 3 days for DRAFT/PENDING states
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
    10,
    'Your platform engineering background matches our reliability initiatives and cloud migration roadmap.',
    NULL,
    10,
    11,
    'H0004',
    'H0004',
    'DRAFT',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '9 days'
  ),
  (
    11,
    'Your frontend and design system experience fits our product scale phase.',
    NULL,
    11,
    10,
    'H0003',
    'H0003',
    'PENDING_APPROVER',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    12,
    'Your data pipeline expertise can accelerate our analytics foundation project.',
    NULL,
    12,
    12,
    'H0005',
    'H0006',
    'PENDING_ADMIN',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '7 days'
  ),
  (
    13,
    'Your secure development knowledge aligns with our security-first architecture goals.',
    NULL,
    13,
    13,
    'H0004',
    'H0006',
    'REJECTED_BY_APPROVER',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '11 days'
  ),
  (
    14,
    'Your backend service design is exactly what our high-throughput API team needs.',
    NULL,
    1,
    14,
    'H0003',
    'H0007',
    'REJECTED_BY_ADMIN_TO_APPROVER',
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '13 days'
  ),
  (
    15,
    'Your incident response and SRE collaboration background is ideal for our platform mission.',
    NULL,
    3,
    15,
    'H0005',
    'H0007',
    'REJECTED_BY_ADMIN_TO_ADMIN',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '15 days'
  ),
  (
    16,
    'Your frontend architecture leadership would strongly contribute to our next product cycle.',
    NOW() - INTERVAL '2 days',
    11,
    10,
    'H0003',
    'H0007',
    'AVAILABLE',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    17,
    'Your data engineering profile matches our new growth analytics platform.',
    NOW() - INTERVAL '1 days',
    12,
    12,
    'H0004',
    'H0004',
    'SENT',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 days'
  ),
  (
    18,
    'Your cloud platform experience would be an immediate fit for our migration squad.',
    NULL,
    10,
    11,
    'H0005',
    'H0005',
    'DRAFT',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    19,
    'Your backend and DevOps hybrid background could bridge product and platform teams.',
    NULL,
    10,
    14,
    'H0003',
    'H0003',
    'PENDING_APPROVER',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    20,
    'Your security operation skills can help us improve our incident readiness posture.',
    NULL,
    13,
    13,
    'H0004',
    'H0006',
    'PENDING_ADMIN',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    21,
    'Your analytical thinking and business partnership style are ideal for this role.',
    NULL,
    4,
    5,
    'H0005',
    'H0006',
    'REJECTED_BY_APPROVER',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days'
  )
ON CONFLICT (scout_message_id) DO NOTHING;

-- =====================================
-- Additional histories
-- Includes approval-like (sent_at set) and reject-like (return_comment/returned_by set)
-- =====================================
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
    10,
    11,
    'Your frontend and design system experience fits our product scale phase.',
    '具体的な成果指標を追記してください。',
    'H0006',
    NOW() - INTERVAL '6 days',
    NULL
  ),
  (
    11,
    12,
    'Your data pipeline expertise can accelerate our analytics foundation project.',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '7 days'
  ),
  (
    12,
    13,
    'Your secure development knowledge aligns with our security-first architecture goals.',
    '表現が抽象的なので、業務要件との紐づけを明確化してください。',
    'H0006',
    NOW() - INTERVAL '11 days',
    NULL
  ),
  (
    13,
    14,
    'Your backend service design is exactly what our high-throughput API team needs.',
    '管理者観点での法令・リスク表現を見直してください。',
    'H0007',
    NOW() - INTERVAL '13 days',
    NULL
  ),
  (
    14,
    15,
    'Your incident response and SRE collaboration background is ideal for our platform mission.',
    '管理者再申請向けに根拠データを追加してください。',
    'H0007',
    NOW() - INTERVAL '15 days',
    NULL
  ),
  (
    15,
    16,
    'Your frontend architecture leadership would strongly contribute to our next product cycle.',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '2 days'
  ),
  (
    16,
    17,
    'Your data engineering profile matches our new growth analytics platform.',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '1 days'
  ),
  (
    17,
    19,
    'Your backend and DevOps hybrid background could bridge product and platform teams.',
    '魅力訴求が弱いため、冒頭の一文を改善してください。',
    'H0006',
    NOW() - INTERVAL '4 days',
    NULL
  ),
  (
    18,
    20,
    'Your security operation skills can help us improve our incident readiness posture.',
    NULL,
    NULL,
    NULL,
    NOW() - INTERVAL '5 days'
  ),
  (
    19,
    21,
    'Your analytical thinking and business partnership style are ideal for this role.',
    '対象職種との関連性を具体例で補足してください。',
    'H0006',
    NOW() - INTERVAL '8 days',
    NULL
  )
ON CONFLICT (scout_message_history_id) DO NOTHING;

INSERT INTO RETURN_COMMENT_HISTORY_GENRES (scout_message_history_id, genre_id) VALUES
  (10, 10),
  (12, 2),
  (13, 13),
  (13, 14),
  (14, 14),
  (17, 7),
  (19, 8)
ON CONFLICT (scout_message_history_id, genre_id) DO NOTHING;

COMMIT;
