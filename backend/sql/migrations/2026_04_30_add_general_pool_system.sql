-- General pool betting system migration
-- Date: 2026-04-30
-- Applies flexible pools, pool options, and pool entries.

SET NAMES utf8mb4;

CREATE TABLE `pools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `min_stake` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `platform_fee_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `start_time` datetime DEFAULT NULL,
  `lock_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('pending','open','locked','awaiting_result','settled','cancelled') NOT NULL DEFAULT 'pending',
  `winning_option_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pools_currency` (`currency_id`),
  KEY `idx_pools_status` (`status`),
  KEY `idx_pools_lock_time` (`lock_time`),
  KEY `idx_pools_end_time` (`end_time`),
  KEY `idx_pools_created_by` (`created_by`),
  KEY `idx_pools_winning_option` (`winning_option_id`),
  CONSTRAINT `fk_pools_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_pools_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pool_options` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pool_id` int(11) NOT NULL,
  `option_label` varchar(255) NOT NULL,
  `option_key` varchar(100) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_pool_option_key` (`pool_id`,`option_key`),
  KEY `idx_pool_options_pool` (`pool_id`),
  KEY `idx_pool_options_sort` (`pool_id`,`sort_order`),
  CONSTRAINT `fk_pool_options_pool` FOREIGN KEY (`pool_id`) REFERENCES `pools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `pools`
  ADD CONSTRAINT `fk_pools_winning_option`
  FOREIGN KEY (`winning_option_id`) REFERENCES `pool_options` (`id`) ON DELETE SET NULL;

CREATE TABLE `pool_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pool_id` int(11) NOT NULL,
  `pool_option_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `stake_amount` decimal(24,8) NOT NULL,
  `payout_amount` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `status` enum('active','won','lost','refunded') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pool_entries_pool` (`pool_id`),
  KEY `idx_pool_entries_option` (`pool_option_id`),
  KEY `idx_pool_entries_user` (`user_id`),
  KEY `idx_pool_entries_wallet` (`wallet_id`),
  KEY `idx_pool_entries_status` (`status`),
  CONSTRAINT `fk_pool_entries_option` FOREIGN KEY (`pool_option_id`) REFERENCES `pool_options` (`id`),
  CONSTRAINT `fk_pool_entries_pool` FOREIGN KEY (`pool_id`) REFERENCES `pools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pool_entries_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pool_entries_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
