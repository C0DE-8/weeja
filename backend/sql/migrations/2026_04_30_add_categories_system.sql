-- Category system migration
-- Date: 2026-04-30

SET NAMES utf8mb4;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum('sport','event') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_categories_name` (`name`),
  KEY `idx_categories_type_active` (`type`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categories` (`name`, `type`, `is_active`) VALUES
('Soccer', 'sport', 1),
('Basketball', 'sport', 1),
('Volleyball', 'sport', 1),
('Baseball', 'sport', 1),
('Boxing', 'sport', 1),
('Hockey', 'sport', 1),
('Tennis', 'sport', 1),
('Competitions', 'event', 1),
('Politics', 'event', 1),
('Reality Show', 'event', 1),
('Cryptocurrency', 'event', 1),
('Sports', 'event', 1)
ON DUPLICATE KEY UPDATE
  `type` = VALUES(`type`),
  `is_active` = VALUES(`is_active`);

INSERT INTO `categories` (`name`, `type`, `is_active`)
SELECT DISTINCT
  p.category,
  CASE
    WHEN LOWER(p.category) IN ('soccer', 'basketball', 'volleyball', 'baseball', 'boxing', 'hockey', 'tennis') THEN 'sport'
    ELSE 'event'
  END,
  1
FROM `pools` p
LEFT JOIN `categories` c ON c.name = p.category
WHERE p.category IS NOT NULL
  AND TRIM(p.category) <> ''
  AND c.id IS NULL;

ALTER TABLE `pools`
  ADD COLUMN `category_id` int(11) DEFAULT NULL AFTER `description`;

UPDATE `pools` p
INNER JOIN `categories` c ON c.name = p.category
SET p.category_id = c.id
WHERE p.category_id IS NULL;

ALTER TABLE `pools`
  MODIFY `category_id` int(11) NOT NULL,
  ADD KEY `idx_pools_category` (`category_id`),
  ADD CONSTRAINT `fk_pools_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  DROP COLUMN `category`;
