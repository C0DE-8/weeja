-- Pool schedule test seed
-- Use this after running:
-- 1. 2026_04_30_add_general_pool_system.sql
-- 2. 2026_04_30_add_categories_system.sql
-- 3. 2026_04_30_add_pool_schedule_management.sql

SET NAMES utf8mb4;

START TRANSACTION;

SET @admin_user_id = (
  SELECT id
  FROM users
  WHERE role IN ('super_admin', 'admin')
  ORDER BY FIELD(role, 'super_admin', 'admin'), id ASC
  LIMIT 1
);

SET @soccer_category_id = (
  SELECT id
  FROM categories
  WHERE name = 'Soccer' AND is_active = 1
  LIMIT 1
);

SET @politics_category_id = (
  SELECT id
  FROM categories
  WHERE name = 'Politics' AND is_active = 1
  LIMIT 1
);

SET @usd_currency_id = (
  SELECT id
  FROM currencies
  WHERE code = 'USD'
  LIMIT 1
);

SET @ngn_currency_id = (
  SELECT id
  FROM currencies
  WHERE code = 'NGN'
  LIMIT 1
);

-- Pool 1: no schedule yet, admin can update later
INSERT INTO pools (
  title,
  description,
  category_id,
  currency_id,
  min_stake,
  platform_fee_percent,
  start_time,
  lock_time,
  end_time,
  status,
  winning_option_id,
  created_by
) VALUES (
  'Arsenal vs Chelsea Winner',
  'Test pool created without schedule so admin can set start, lock, and end later.',
  @soccer_category_id,
  @usd_currency_id,
  5.00,
  8.50,
  NULL,
  NULL,
  NULL,
  'pending',
  NULL,
  @admin_user_id
);

SET @pool_id_1 = LAST_INSERT_ID();

INSERT INTO pool_options (pool_id, option_label, option_key, sort_order) VALUES
(@pool_id_1, 'Arsenal', 'arsenal', 1),
(@pool_id_1, 'Chelsea', 'chelsea', 2),
(@pool_id_1, 'Draw', 'draw', 3);

-- Pool 2: fully scheduled and open
INSERT INTO pools (
  title,
  description,
  category_id,
  currency_id,
  min_stake,
  platform_fee_percent,
  start_time,
  lock_time,
  end_time,
  status,
  winning_option_id,
  created_by
) VALUES (
  'Presidential Debate Outcome',
  'Test event pool with start, lock, and end already set.',
  @politics_category_id,
  @ngn_currency_id,
  1000.00,
  10.00,
  '2026-05-01 09:00:00',
  '2026-05-01 18:00:00',
  '2026-05-01 21:00:00',
  'open',
  NULL,
  @admin_user_id
);

SET @pool_id_2 = LAST_INSERT_ID();

INSERT INTO pool_options (pool_id, option_label, option_key, sort_order) VALUES
(@pool_id_2, 'Candidate A', 'candidate_a', 1),
(@pool_id_2, 'Candidate B', 'candidate_b', 2),
(@pool_id_2, 'No Clear Winner', 'no_clear_winner', 3);

-- Pool 3: started and locked, waiting for result
INSERT INTO pools (
  title,
  description,
  category_id,
  currency_id,
  min_stake,
  platform_fee_percent,
  start_time,
  lock_time,
  end_time,
  status,
  winning_option_id,
  created_by
) VALUES (
  'Lakers vs Celtics Total Points',
  'Test pool for status updates after lock.',
  @soccer_category_id,
  @usd_currency_id,
  10.00,
  7.50,
  '2026-05-02 12:00:00',
  '2026-05-02 15:00:00',
  '2026-05-02 17:00:00',
  'awaiting_result',
  NULL,
  @admin_user_id
);

SET @pool_id_3 = LAST_INSERT_ID();

INSERT INTO pool_options (pool_id, option_label, option_key, sort_order) VALUES
(@pool_id_3, 'Over 210.5', 'over_210_5', 1),
(@pool_id_3, 'Under 210.5', 'under_210_5', 2);

COMMIT;
