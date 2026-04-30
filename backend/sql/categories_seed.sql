SET NAMES utf8mb4;

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
