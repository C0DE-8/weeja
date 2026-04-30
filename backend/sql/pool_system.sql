-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 30, 2026 at 05:33 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pool_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_registration_passkeys`
--

CREATE TABLE `admin_registration_passkeys` (
  `id` int(11) NOT NULL,
  `passkey_hash` varchar(255) NOT NULL,
  `passkey_value` varchar(255) DEFAULT NULL,
  `label` varchar(120) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `used_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_registration_passkeys`
--

INSERT INTO `admin_registration_passkeys` (`id`, `passkey_hash`, `passkey_value`, `label`, `created_by`, `used_by`, `is_active`, `expires_at`, `used_at`, `created_at`, `updated_at`) VALUES
(2, '$2b$10$U2D5adFbwEeZEDlC2OMTne/ED32V42PHFYI2O4QWbQWxkKuqI7l/y', '123456', 'admin upboarding', 1, NULL, 1, NULL, NULL, '2026-04-30 10:40:30', '2026-04-30 10:40:30');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('sport','event') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Soccer', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(2, 'Basketball', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(3, 'Volleyball', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(4, 'Baseball', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(5, 'Boxing', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(6, 'Hockey', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(7, 'Tennis', 'sport', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(8, 'Competitions', 'event', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(9, 'Politics', 'event', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(10, 'Reality Show', 'event', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(11, 'Cryptocurrency', 'event', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25'),
(12, 'Sports', 'event', 1, '2026-04-30 11:02:25', '2026-04-30 11:02:25');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `decimal_places` tinyint(3) unsigned NOT NULL DEFAULT 2,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `decimal_places`, `status`, `created_at`, `updated_at`) VALUES
(1, 'USD', 'US Dollar', 2, 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00'),
(2, 'NGN', 'Nigerian Naira', 2, 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00'),
(3, 'CRYPTO', 'Cryptocurrency', 8, 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `pools`
--

CREATE TABLE `pools` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `min_stake` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `platform_fee_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `start_time` datetime DEFAULT NULL,
  `lock_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('pending','open','locked','awaiting_result','settled','cancelled') NOT NULL DEFAULT 'pending',
  `review_status` enum('approved','under_review','rejected') NOT NULL DEFAULT 'approved',
  `review_notes` varchar(255) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `winning_option_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `creation_fee_amount` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `creation_fee_wallet_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pools`
--

INSERT INTO `pools` (`id`, `title`, `description`, `category_id`, `currency_id`, `min_stake`, `platform_fee_percent`, `start_time`, `lock_time`, `end_time`, `status`, `review_status`, `review_notes`, `reviewed_by`, `reviewed_at`, `approved_at`, `rejected_at`, `winning_option_id`, `created_by`, `creation_fee_amount`, `creation_fee_wallet_id`, `created_at`, `updated_at`) VALUES
(1, 'Arsenal vs Chelsea Winner', 'Test pool created without schedule so admin can set start, lock, and end later.', 1, 1, 5.00000000, 8.50, NULL, NULL, NULL, 'open', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00000000, NULL, '2026-04-30 14:25:15', '2026-04-30 15:02:09'),
(2, 'Presidential Debate Outcome', 'Test event pool with start, lock, and end already set.', 9, 2, 1000.00000000, 10.00, '2026-05-01 09:00:00', '2026-05-01 18:00:00', '2026-05-01 21:00:00', 'open', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00000000, NULL, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(3, 'Lakers vs Celtics Total Points', 'Test pool for status updates after lock.', 1, 1, 10.00000000, 7.50, '2026-05-02 12:00:00', '2026-05-02 15:00:00', '2026-05-02 17:00:00', 'awaiting_result', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, 1, 0.00000000, NULL, '2026-04-30 14:25:15', '2026-04-30 14:25:15');

-- --------------------------------------------------------

--
-- Table structure for table `pool_creation_fee_settings`
--

CREATE TABLE `pool_creation_fee_settings` (
  `id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `amount` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pool_creation_fee_settings`
--

INSERT INTO `pool_creation_fee_settings` (`id`, `currency_id`, `amount`, `is_active`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 3, 0.00000000, 1, NULL, NULL, '2026-04-30 15:31:51', '2026-04-30 15:31:51'),
(2, 2, 0.00000000, 1, NULL, NULL, '2026-04-30 15:31:51', '2026-04-30 15:31:51'),
(3, 1, 0.00000000, 1, NULL, NULL, '2026-04-30 15:31:51', '2026-04-30 15:31:51');

-- --------------------------------------------------------

--
-- Table structure for table `pool_entries`
--

CREATE TABLE `pool_entries` (
  `id` int(11) NOT NULL,
  `pool_id` int(11) NOT NULL,
  `pool_option_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `stake_amount` decimal(24,8) NOT NULL,
  `payout_amount` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `status` enum('active','won','lost','refunded') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pool_options`
--

CREATE TABLE `pool_options` (
  `id` int(11) NOT NULL,
  `pool_id` int(11) NOT NULL,
  `option_label` varchar(255) NOT NULL,
  `option_key` varchar(100) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pool_options`
--

INSERT INTO `pool_options` (`id`, `pool_id`, `option_label`, `option_key`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Arsenal', 'arsenal', 1, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(2, 1, 'Chelsea', 'chelsea', 2, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(3, 1, 'Draw', 'draw', 3, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(4, 2, 'Candidate A', 'candidate_a', 1, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(5, 2, 'Candidate B', 'candidate_b', 2, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(6, 2, 'No Clear Winner', 'no_clear_winner', 3, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(7, 3, 'Over 210.5', 'over_210_5', 1, '2026-04-30 14:25:15', '2026-04-30 14:25:15'),
(8, 3, 'Under 210.5', 'under_210_5', 2, '2026-04-30 14:25:15', '2026-04-30 14:25:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `otp_hash` varchar(255) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `role` enum('user','admin','super_admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `email_verified`, `otp_hash`, `otp_expires_at`, `role`, `created_at`) VALUES
(1, 'Super Admin', 'admin@weeja.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'super_admin', '2026-04-30 10:04:09'),
(2, 'Samuel Oghenchovwe', '8amlight@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19'),
(3, 'one', 'one@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19'),
(4, 'two', 'two@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19'),
(5, 'three', 'three@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19'),
(6, 'four', 'four@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19'),
(7, 'five', 'five@gmail.com', '$2b$10$57OmnYGe3az9DfP5VECwqORuv0BtxpdUQq10FWE8ntOCj0xOg8.1S', 1, NULL, NULL, 'user', '2026-04-30 10:10:19');

-- --------------------------------------------------------

--
-- Table structure for table `user_wallets`
--

CREATE TABLE `user_wallets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `balance` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `status` enum('active','frozen') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_wallets`
--

INSERT INTO `user_wallets` (`id`, `user_id`, `currency_id`, `balance`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 0.00000000, 'active', '2026-04-30 10:11:18', '2026-04-30 10:11:18'),
(2, 2, 2, 0.00000000, 'active', '2026-04-30 10:11:18', '2026-04-30 10:11:18'),
(3, 2, 3, 0.00000000, 'active', '2026-04-30 10:11:18', '2026-04-30 10:11:18');

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `amount` decimal(24,8) NOT NULL,
  `balance_after` decimal(24,8) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_passkeys_created_by` (`created_by`),
  ADD KEY `idx_admin_passkeys_used_by` (`used_by`),
  ADD KEY `idx_admin_passkeys_active` (`is_active`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_categories_name` (`name`),
  ADD KEY `idx_categories_type_active` (`type`,`is_active`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `pools`
--
ALTER TABLE `pools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pools_currency` (`currency_id`),
  ADD KEY `idx_pools_status` (`status`),
  ADD KEY `idx_pools_lock_time` (`lock_time`),
  ADD KEY `idx_pools_created_by` (`created_by`),
  ADD KEY `idx_pools_winning_option` (`winning_option_id`),
  ADD KEY `idx_pools_category` (`category_id`),
  ADD KEY `idx_pools_end_time` (`end_time`),
  ADD KEY `idx_pools_review_status` (`review_status`),
  ADD KEY `idx_pools_reviewed_by` (`reviewed_by`),
  ADD KEY `idx_pools_creation_fee_wallet` (`creation_fee_wallet_id`);

--
-- Indexes for table `pool_creation_fee_settings`
--
ALTER TABLE `pool_creation_fee_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pool_creation_fee_currency` (`currency_id`),
  ADD KEY `idx_pool_creation_fee_active` (`is_active`),
  ADD KEY `idx_pool_creation_fee_created_by` (`created_by`),
  ADD KEY `idx_pool_creation_fee_updated_by` (`updated_by`);

--
-- Indexes for table `pool_entries`
--
ALTER TABLE `pool_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pool_entries_pool` (`pool_id`),
  ADD KEY `idx_pool_entries_option` (`pool_option_id`),
  ADD KEY `idx_pool_entries_user` (`user_id`),
  ADD KEY `idx_pool_entries_wallet` (`wallet_id`),
  ADD KEY `idx_pool_entries_status` (`status`);

--
-- Indexes for table `pool_options`
--
ALTER TABLE `pool_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pool_option_key` (`pool_id`,`option_key`),
  ADD KEY `idx_pool_options_pool` (`pool_id`),
  ADD KEY `idx_pool_options_sort` (`pool_id`,`sort_order`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_wallets`
--
ALTER TABLE `user_wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_currency` (`user_id`,`currency_id`),
  ADD KEY `idx_user_wallets_user` (`user_id`),
  ADD KEY `idx_user_wallets_currency` (`currency_id`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wallet_transactions_wallet` (`wallet_id`),
  ADD KEY `idx_wallet_transactions_status` (`status`),
  ADD KEY `idx_wallet_transactions_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pools`
--
ALTER TABLE `pools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pool_creation_fee_settings`
--
ALTER TABLE `pool_creation_fee_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pool_entries`
--
ALTER TABLE `pool_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pool_options`
--
ALTER TABLE `pool_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_wallets`
--
ALTER TABLE `user_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  ADD CONSTRAINT `fk_admin_passkeys_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_admin_passkeys_used_by` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pools`
--
ALTER TABLE `pools`
  ADD CONSTRAINT `fk_pools_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `fk_pools_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_pools_creation_fee_wallet` FOREIGN KEY (`creation_fee_wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pools_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
  ADD CONSTRAINT `fk_pools_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pools_winning_option` FOREIGN KEY (`winning_option_id`) REFERENCES `pool_options` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pool_creation_fee_settings`
--
ALTER TABLE `pool_creation_fee_settings`
  ADD CONSTRAINT `fk_pool_creation_fee_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pool_creation_fee_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
  ADD CONSTRAINT `fk_pool_creation_fee_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `pool_entries`
--
ALTER TABLE `pool_entries`
  ADD CONSTRAINT `fk_pool_entries_option` FOREIGN KEY (`pool_option_id`) REFERENCES `pool_options` (`id`),
  ADD CONSTRAINT `fk_pool_entries_pool` FOREIGN KEY (`pool_id`) REFERENCES `pools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pool_entries_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pool_entries_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pool_options`
--
ALTER TABLE `pool_options`
  ADD CONSTRAINT `fk_pool_options_pool` FOREIGN KEY (`pool_id`) REFERENCES `pools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_wallets`
--
ALTER TABLE `user_wallets`
  ADD CONSTRAINT `fk_user_wallets_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
  ADD CONSTRAINT `fk_user_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `fk_wallet_transactions_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
