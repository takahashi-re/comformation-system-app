
-- スカウト文テーブル（初回起動時に自動作成）
-- 1. NG_WORDS
CREATE TABLE IF NOT EXISTS NG_WORDS (
  ng_word_id SERIAL PRIMARY KEY,
  ng_word VARCHAR(100) NOT NULL
);

-- 2. MAX_TEXT_LENGTH
CREATE TABLE IF NOT EXISTS MAX_TEXT_LENGTH (
  length_id SERIAL PRIMARY KEY,
  max_length INTEGER NOT NULL
);

-- 3. JOB_POSTINGS
CREATE TABLE IF NOT EXISTS JOB_POSTINGS (
  job_posting_id SERIAL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL,
  job_title VARCHAR(140) NOT NULL,
  job_description TEXT,
  min_salary INTEGER,
  max_salary INTEGER,
  required_skills TEXT,
  job_appeal TEXT,
  work_location VARCHAR(200)
);

-- 4. JOB_TYPES
CREATE TABLE IF NOT EXISTS JOB_TYPES (
  job_type_id SERIAL PRIMARY KEY,
  job_type_name VARCHAR(100) NOT NULL
);

-- 5. JOB_POSTING_JOB_TYPES (中間テーブル)
CREATE TABLE IF NOT EXISTS JOB_POSTING_JOB_TYPES (
  job_posting_id INTEGER NOT NULL,
  job_type_id INTEGER NOT NULL,
  PRIMARY KEY (job_posting_id, job_type_id),
  FOREIGN KEY (job_posting_id) REFERENCES JOB_POSTINGS(job_posting_id) ON DELETE CASCADE,
  FOREIGN KEY (job_type_id) REFERENCES JOB_TYPES(job_type_id) ON DELETE CASCADE
);

-- 6. JOB_SEEKERS
CREATE TABLE IF NOT EXISTS JOB_SEEKERS (
  job_seeker_id SERIAL PRIMARY KEY,
  age INTEGER NOT NULL,
  gender VARCHAR(20) NOT NULL,
  desired_position VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 7. JOB_SEEKER_JOB_TYPES (中間テーブル)
CREATE TABLE IF NOT EXISTS JOB_SEEKER_JOB_TYPES (
  job_seeker_id INTEGER NOT NULL,
  job_type_id INTEGER NOT NULL,
  PRIMARY KEY (job_seeker_id, job_type_id),
  FOREIGN KEY (job_seeker_id) REFERENCES JOB_SEEKERS(job_seeker_id) ON DELETE CASCADE,
  FOREIGN KEY (job_type_id) REFERENCES JOB_TYPES(job_type_id) ON DELETE CASCADE
);

-- 8. POSITIONS
CREATE TABLE IF NOT EXISTS POSITIONS (
  position_id SERIAL PRIMARY KEY,
  position_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 9. EMPLOYEES
CREATE TABLE IF NOT EXISTS EMPLOYEES (
  employee_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  position_id INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (position_id) REFERENCES POSITIONS(position_id) ON DELETE SET NULL
);

-- 10. RETURN_COMMENT_GENRES
CREATE TABLE IF NOT EXISTS RETURN_COMMENT_GENRES (
  genre_id SERIAL PRIMARY KEY,
  genre_name VARCHAR(100) NOT NULL
);

-- 11. RETURN_COMMENT_GENRE_POSITIONS (中間テーブル)
CREATE TABLE IF NOT EXISTS RETURN_COMMENT_GENRE_POSITIONS (
  genre_id INTEGER NOT NULL,
  position_id INTEGER NOT NULL,
  PRIMARY KEY (genre_id, position_id),
  FOREIGN KEY (genre_id) REFERENCES RETURN_COMMENT_GENRES(genre_id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES POSITIONS(position_id) ON DELETE CASCADE
);

-- 12. SCOUT_MESSAGES
CREATE TABLE IF NOT EXISTS SCOUT_MESSAGES (
  scout_message_id SERIAL PRIMARY KEY,
  message_content TEXT,
  sent_at TIMESTAMP,
  job_posting_id INTEGER,
  job_seeker_id INTEGER,
  created_by_employee_id VARCHAR(20),
  updated_by_employee_id VARCHAR(20),
  approved_primary_by_employee_id VARCHAR(20),
  approved_secondary_by_employee_id VARCHAR(20),
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (job_posting_id) REFERENCES JOB_POSTINGS(job_posting_id) ON DELETE SET NULL,
  FOREIGN KEY (job_seeker_id) REFERENCES JOB_SEEKERS(job_seeker_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_primary_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_secondary_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL
);

-- 13. SCOUT_MESSAGE_HISTORIES
CREATE TABLE IF NOT EXISTS SCOUT_MESSAGE_HISTORIES (
  scout_message_history_id SERIAL PRIMARY KEY,
  scout_message_id INTEGER,
  message_content TEXT,
  return_comment TEXT,
  returned_by_employee_id VARCHAR(20),
  approved_primary_by_employee_id VARCHAR(20),
  approved_secondary_by_employee_id VARCHAR(20),
  returned_at TIMESTAMP,
  sent_at TIMESTAMP,
  FOREIGN KEY (scout_message_id) REFERENCES SCOUT_MESSAGES(scout_message_id) ON DELETE CASCADE,
  FOREIGN KEY (returned_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_primary_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL,
  FOREIGN KEY (approved_secondary_by_employee_id) REFERENCES EMPLOYEES(employee_id) ON DELETE SET NULL
);

-- 14. RETURN_COMMENT_HISTORY_GENRES (中間テーブル)
CREATE TABLE IF NOT EXISTS RETURN_COMMENT_HISTORY_GENRES (
  scout_message_history_id INTEGER NOT NULL,
  genre_id INTEGER NOT NULL,
  PRIMARY KEY (scout_message_history_id, genre_id),
  FOREIGN KEY (scout_message_history_id) REFERENCES SCOUT_MESSAGE_HISTORIES(scout_message_history_id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES RETURN_COMMENT_GENRES(genre_id) ON DELETE CASCADE
);
