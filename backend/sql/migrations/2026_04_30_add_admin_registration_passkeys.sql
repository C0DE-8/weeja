-- Admin registration passkeys
-- Date: 2026-04-30

SET NAMES utf8mb4;

CREATE TABLE `admin_registration_passkeys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `passkey_hash` varchar(255) NOT NULL,
  `label` varchar(120) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `used_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin_passkeys_created_by` (`created_by`),
  KEY `idx_admin_passkeys_used_by` (`used_by`),
  KEY `idx_admin_passkeys_active` (`is_active`),
  CONSTRAINT `fk_admin_passkeys_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_admin_passkeys_used_by` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
