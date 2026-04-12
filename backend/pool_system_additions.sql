-- Additions for OTP registration, email verification, and wallets.
-- Run against existing `pool_system` database after `users` table exists.
-- Do not drop or recreate existing tables.

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- users: OTP + email verification (matches existing users table)
-- ---------------------------------------------------------------------------
ALTER TABLE `users`
  ADD COLUMN `email_verified` tinyint(1) NOT NULL DEFAULT 0 AFTER `password`,
  ADD COLUMN `otp_hash` varchar(255) DEFAULT NULL AFTER `email_verified`,
  ADD COLUMN `otp_expires_at` datetime DEFAULT NULL AFTER `otp_hash`;

-- Existing accounts (no OTP row yet): mark verified so logins keep working.
-- Pending signups have `otp_hash` set and must not match this update.
UPDATE `users` SET `email_verified` = 1 WHERE `otp_hash` IS NULL;

-- ---------------------------------------------------------------------------
-- currencies: USD, NGN, generic crypto bucket
-- ---------------------------------------------------------------------------
CREATE TABLE `currencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `currencies` (`code`, `name`, `status`) VALUES
('USD', 'US Dollar', 'active'),
('NGN', 'Nigerian Naira', 'active'),
('CRYPTO', 'Cryptocurrency', 'active');

-- ---------------------------------------------------------------------------
-- user_wallets: one row per user per currency
-- ---------------------------------------------------------------------------
CREATE TABLE `user_wallets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `balance` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `status` enum('active','frozen') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_currency` (`user_id`,`currency_id`),
  KEY `idx_user_wallets_user` (`user_id`),
  KEY `idx_user_wallets_currency` (`currency_id`),
  CONSTRAINT `fk_user_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_wallets_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ---------------------------------------------------------------------------
-- wallet_transactions: ledger per wallet
-- ---------------------------------------------------------------------------
CREATE TABLE `wallet_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wallet_id` int(11) NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `amount` decimal(24,8) NOT NULL,
  `balance_after` decimal(24,8) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_wallet_transactions_wallet` (`wallet_id`),
  KEY `idx_wallet_transactions_status` (`status`),
  KEY `idx_wallet_transactions_created` (`created_at`),
  CONSTRAINT `fk_wallet_transactions_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
