USE `fullstack_blog`;

-- 旧库迁移脚本
-- 适用场景：数据库里已经存在旧版 `users` / `articles` 表，现在要升级到当前文章模块结构
-- 执行前建议先备份数据库

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`),
  UNIQUE KEY `uk_categories_slug` (`slug`),
  KEY `idx_categories_sort_order` (`sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password`)
SELECT 'admin', '$2b$10$Zpvse.MS0A.aQL0mjCZHeOWSab7Y9FR4mwAUWCHDTYl8.P.bEUco2'
WHERE NOT EXISTS (
  SELECT 1 FROM `users` WHERE `username` = 'admin'
);

INSERT INTO `categories` (`name`, `slug`, `sort_order`)
SELECT '后端开发', 'backend', 10
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'backend'
);

INSERT INTO `categories` (`name`, `slug`, `sort_order`)
SELECT '前端开发', 'frontend', 20
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'frontend'
);

INSERT INTO `categories` (`name`, `slug`, `sort_order`)
SELECT '全栈实战', 'fullstack', 30
WHERE NOT EXISTS (
  SELECT 1 FROM `categories` WHERE `slug` = 'fullstack'
);

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft' AFTER `content`;

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `author_id` INT UNSIGNED NULL AFTER `status`;

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `category_id` INT UNSIGNED NULL DEFAULT NULL AFTER `author_id`;

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`;

UPDATE `articles`
SET `author_id` = (
  SELECT `id` FROM `users` WHERE `username` = 'admin' LIMIT 1
)
WHERE `author_id` IS NULL;

UPDATE `articles`
SET `status` = 'published'
WHERE `status` IS NULL OR `status` = '';

ALTER TABLE `articles`
  MODIFY COLUMN `author_id` INT UNSIGNED NOT NULL,
  MODIFY COLUMN `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  MODIFY COLUMN `category_id` INT UNSIGNED NULL DEFAULT NULL;

SET @add_idx_articles_author_id = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND index_name = 'idx_articles_author_id'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD KEY `idx_articles_author_id` (`author_id`)'
  )
);
PREPARE stmt FROM @add_idx_articles_author_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_articles_status_created = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND index_name = 'idx_articles_status_created'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD KEY `idx_articles_status_created` (`status`, `created_at`)'
  )
);
PREPARE stmt FROM @add_idx_articles_status_created;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_articles_deleted_created = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND index_name = 'idx_articles_deleted_created'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD KEY `idx_articles_deleted_created` (`deleted_at`, `created_at`)'
  )
);
PREPARE stmt FROM @add_idx_articles_deleted_created;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_idx_articles_category_id = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND index_name = 'idx_articles_category_id'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD KEY `idx_articles_category_id` (`category_id`)'
  )
);
PREPARE stmt FROM @add_idx_articles_category_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_fk_articles_author = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.key_column_usage
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND constraint_name = 'fk_articles_author'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD CONSTRAINT `fk_articles_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)'
  )
);
PREPARE stmt FROM @add_fk_articles_author;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_fk_articles_category = (
  SELECT IF(
    EXISTS (
      SELECT 1
      FROM information_schema.key_column_usage
      WHERE table_schema = DATABASE()
        AND table_name = 'articles'
        AND constraint_name = 'fk_articles_category'
    ),
    'SELECT 1',
    'ALTER TABLE `articles` ADD CONSTRAINT `fk_articles_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)'
  )
);
PREPARE stmt FROM @add_fk_articles_category;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
