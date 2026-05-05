ALTER TABLE users
  ADD COLUMN verification_token_hash varchar(64) DEFAULT NULL AFTER email_verified,
  ADD COLUMN verification_expires_at datetime DEFAULT NULL AFTER verification_token_hash;

UPDATE users
SET verification_token_hash = NULL,
    verification_expires_at = NULL;

ALTER TABLE users
  DROP COLUMN otp_hash,
  DROP COLUMN otp_expires_at;
