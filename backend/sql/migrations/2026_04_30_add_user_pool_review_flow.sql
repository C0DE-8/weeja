ALTER TABLE `pools`
  ADD COLUMN `review_status` enum('approved','under_review','rejected') NOT NULL DEFAULT 'approved' AFTER `status`,
  ADD COLUMN `review_notes` varchar(255) DEFAULT NULL AFTER `review_status`,
  ADD COLUMN `reviewed_by` int(11) DEFAULT NULL AFTER `review_notes`,
  ADD COLUMN `reviewed_at` datetime DEFAULT NULL AFTER `reviewed_by`,
  ADD COLUMN `approved_at` datetime DEFAULT NULL AFTER `reviewed_at`,
  ADD COLUMN `rejected_at` datetime DEFAULT NULL AFTER `approved_at`,
  ADD COLUMN `creation_fee_amount` decimal(24,8) NOT NULL DEFAULT 0.00000000 AFTER `created_by`,
  ADD COLUMN `creation_fee_wallet_id` int(11) DEFAULT NULL AFTER `creation_fee_amount`,
  ADD KEY `idx_pools_review_status` (`review_status`),
  ADD KEY `idx_pools_reviewed_by` (`reviewed_by`),
  ADD KEY `idx_pools_creation_fee_wallet` (`creation_fee_wallet_id`),
  ADD CONSTRAINT `fk_pools_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pools_creation_fee_wallet` FOREIGN KEY (`creation_fee_wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE SET NULL;

CREATE TABLE `pool_creation_fee_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `currency_id` int(11) NOT NULL,
  `amount` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_pool_creation_fee_currency` (`currency_id`),
  KEY `idx_pool_creation_fee_active` (`is_active`),
  KEY `idx_pool_creation_fee_created_by` (`created_by`),
  KEY `idx_pool_creation_fee_updated_by` (`updated_by`),
  CONSTRAINT `fk_pool_creation_fee_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
  CONSTRAINT `fk_pool_creation_fee_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pool_creation_fee_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pool_creation_fee_settings` (`currency_id`, `amount`, `is_active`)
SELECT `id`, 0.00000000, 1
FROM `currencies`;
