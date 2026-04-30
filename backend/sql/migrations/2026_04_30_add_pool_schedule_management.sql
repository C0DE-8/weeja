-- Pool schedule management migration
-- Date: 2026-04-30

SET NAMES utf8mb4;

ALTER TABLE `pools`
  MODIFY `start_time` datetime DEFAULT NULL,
  MODIFY `lock_time` datetime DEFAULT NULL,
  ADD COLUMN `end_time` datetime DEFAULT NULL AFTER `lock_time`,
  ADD KEY `idx_pools_end_time` (`end_time`);
