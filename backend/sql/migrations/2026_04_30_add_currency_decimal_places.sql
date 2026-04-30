ALTER TABLE `currencies`
  ADD COLUMN `decimal_places` tinyint(3) unsigned NOT NULL DEFAULT 2 AFTER `name`;

UPDATE `currencies`
SET `decimal_places` = CASE
  WHEN `code` IN ('USD', 'NGN') THEN 2
  WHEN `code` = 'CRYPTO' THEN 8
  ELSE 2
END;
