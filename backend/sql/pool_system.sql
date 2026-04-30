-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Apr 30, 2026 at 11:30 AM
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
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `code`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'USD', 'US Dollar', 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00'),
(2, 'NGN', 'Nigerian Naira', 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00'),
(3, 'CRYPTO', 'Cryptocurrency', 'active', '2026-04-12 14:01:00', '2026-04-12 14:01:00');

-- --------------------------------------------------------

--
-- Table structure for table `pools`
--

CREATE TABLE `pools` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `currency_id` int(11) NOT NULL,
  `min_stake` decimal(24,8) NOT NULL DEFAULT 0.00000000,
  `platform_fee_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `start_time` datetime NOT NULL,
  `lock_time` datetime NOT NULL,
  `status` enum('pending','open','locked','awaiting_result','settled','cancelled') NOT NULL DEFAULT 'pending',
  `winning_option_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Table structure for table `admin_registration_passkeys`
--

CREATE TABLE `admin_registration_passkeys` (
  `id` int(11) NOT NULL,
  `passkey_hash` varchar(255) NOT NULL,
  `label` varchar(120) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `used_by` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `expires_at` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  ADD KEY `idx_pools_winning_option` (`winning_option_id`);

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
-- Indexes for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_passkeys_created_by` (`created_by`),
  ADD KEY `idx_admin_passkeys_used_by` (`used_by`),
  ADD KEY `idx_admin_passkeys_active` (`is_active`);

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
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pools`
--
ALTER TABLE `pools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pool_entries`
--
ALTER TABLE `pool_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pool_options`
--
ALTER TABLE `pool_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_wallets`
--
ALTER TABLE `user_wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pools`
--
ALTER TABLE `pools`
  ADD CONSTRAINT `fk_pools_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_pools_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
  ADD CONSTRAINT `fk_pools_winning_option` FOREIGN KEY (`winning_option_id`) REFERENCES `pool_options` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `admin_registration_passkeys`
--
ALTER TABLE `admin_registration_passkeys`
  ADD CONSTRAINT `fk_admin_passkeys_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_admin_passkeys_used_by` FOREIGN KEY (`used_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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
