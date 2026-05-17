-- Ensure the database exists and grant full privileges to the app user
CREATE DATABASE IF NOT EXISTS `investapp`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `investapp`.* TO 'investuser'@'%';
FLUSH PRIVILEGES;
