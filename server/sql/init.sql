CREATE DATABASE IF NOT EXISTS `fullstack_blog`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `fullstack_blog`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `slug` VARCHAR(50) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tags_name` (`name`),
  UNIQUE KEY `uk_tags_slug` (`slug`),
  KEY `idx_tags_sort_order` (`sort_order`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `content` TEXT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `author_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_articles_deleted_created` (`deleted_at`, `created_at`),
  KEY `idx_articles_author_id` (`author_id`),
  KEY `idx_articles_status_created` (`status`, `created_at`),
  KEY `idx_articles_category_id` (`category_id`),
  CONSTRAINT `fk_articles_author`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_articles_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `idx_article_tags_tag_id` (`tag_id`),
  CONSTRAINT `fk_article_tags_article`
    FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_tags_tag`
    FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
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

INSERT INTO `tags` (`name`, `slug`, `sort_order`)
SELECT 'Node.js', 'nodejs', 10
WHERE NOT EXISTS (
  SELECT 1 FROM `tags` WHERE `slug` = 'nodejs'
);

INSERT INTO `tags` (`name`, `slug`, `sort_order`)
SELECT 'React', 'react', 20
WHERE NOT EXISTS (
  SELECT 1 FROM `tags` WHERE `slug` = 'react'
);

INSERT INTO `tags` (`name`, `slug`, `sort_order`)
SELECT 'MySQL', 'mysql', 30
WHERE NOT EXISTS (
  SELECT 1 FROM `tags` WHERE `slug` = 'mysql'
);

INSERT INTO `tags` (`name`, `slug`, `sort_order`)
SELECT '工程化', 'engineering', 40
WHERE NOT EXISTS (
  SELECT 1 FROM `tags` WHERE `slug` = 'engineering'
);

DELIMITER //

CREATE PROCEDURE `ensure_content_schema`()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE `articles`
      ADD COLUMN `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft' AFTER `content`;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND column_name = 'author_id'
  ) THEN
    ALTER TABLE `articles`
      ADD COLUMN `author_id` INT UNSIGNED NULL AFTER `status`;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND column_name = 'category_id'
  ) THEN
    ALTER TABLE `articles`
      ADD COLUMN `category_id` INT UNSIGNED NULL DEFAULT NULL AFTER `author_id`;
  END IF;

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

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND index_name = 'idx_articles_author_id'
  ) THEN
    ALTER TABLE `articles`
      ADD KEY `idx_articles_author_id` (`author_id`);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND index_name = 'idx_articles_status_created'
  ) THEN
    ALTER TABLE `articles`
      ADD KEY `idx_articles_status_created` (`status`, `created_at`);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND index_name = 'idx_articles_deleted_created'
  ) THEN
    ALTER TABLE `articles`
      ADD KEY `idx_articles_deleted_created` (`deleted_at`, `created_at`);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND index_name = 'idx_articles_category_id'
  ) THEN
    ALTER TABLE `articles`
      ADD KEY `idx_articles_category_id` (`category_id`);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND column_name = 'author_id'
      AND referenced_table_name = 'users'
  ) THEN
    ALTER TABLE `articles`
      ADD CONSTRAINT `fk_articles_author`
        FOREIGN KEY (`author_id`) REFERENCES `users` (`id`);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.key_column_usage
    WHERE table_schema = DATABASE()
      AND table_name = 'articles'
      AND column_name = 'category_id'
      AND referenced_table_name = 'categories'
  ) THEN
    ALTER TABLE `articles`
      ADD CONSTRAINT `fk_articles_category`
        FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
  END IF;
END //

CALL `ensure_content_schema`() //
DROP PROCEDURE `ensure_content_schema` //

DELIMITER ;

INSERT INTO `articles` (`title`, `content`, `status`, `author_id`, `category_id`)
SELECT
  'Node.js 入门',
  '这是一篇初始化测试文章，用来验证文章列表接口是否正常。',
  'published',
  u.id,
  c.id
FROM `users` u
JOIN `categories` c ON c.slug = 'backend'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = 'Node.js 入门'
  );

INSERT INTO `articles` (`title`, `content`, `status`, `author_id`, `category_id`)
SELECT
  'React 项目记录',
  '这是一篇 React 测试文章，用来验证分页、详情和编辑接口。',
  'published',
  u.id,
  c.id
FROM `users` u
JOIN `categories` c ON c.slug = 'frontend'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = 'React 项目记录'
  );

INSERT INTO `articles` (`title`, `content`, `status`, `author_id`, `category_id`)
SELECT
  '全栈开发备忘',
  '这是一篇全栈测试文章，用来验证搜索、草稿、分类和标签能力。',
  'draft',
  u.id,
  c.id
FROM `users` u
JOIN `categories` c ON c.slug = 'fullstack'
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = '全栈开发备忘'
  );

UPDATE `articles`
SET `status` = 'published'
WHERE `title` IN ('Node.js 入门', 'React 项目记录');

UPDATE `articles`
SET `status` = 'draft'
WHERE `title` = '全栈开发备忘';

UPDATE `articles` a
JOIN `categories` c ON c.slug = 'backend'
SET a.`category_id` = c.`id`
WHERE a.`title` = 'Node.js 入门';

UPDATE `articles` a
JOIN `categories` c ON c.slug = 'frontend'
SET a.`category_id` = c.`id`
WHERE a.`title` = 'React 项目记录';

UPDATE `articles` a
JOIN `categories` c ON c.slug = 'fullstack'
SET a.`category_id` = c.`id`
WHERE a.`title` = '全栈开发备忘';

INSERT IGNORE INTO `article_tags` (`article_id`, `tag_id`)
SELECT a.id, t.id
FROM `articles` a
JOIN `tags` t ON t.slug IN ('nodejs', 'mysql')
WHERE a.title = 'Node.js 入门';

INSERT IGNORE INTO `article_tags` (`article_id`, `tag_id`)
SELECT a.id, t.id
FROM `articles` a
JOIN `tags` t ON t.slug IN ('react', 'engineering')
WHERE a.title = 'React 项目记录';

INSERT IGNORE INTO `article_tags` (`article_id`, `tag_id`)
SELECT a.id, t.id
FROM `articles` a
JOIN `tags` t ON t.slug IN ('nodejs', 'react', 'engineering')
WHERE a.title = '全栈开发备忘';
