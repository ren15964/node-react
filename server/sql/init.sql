CREATE DATABASE IF NOT EXISTS `fullstack_blog`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `fullstack_blog`;

-- 新库初始化脚本
-- 适用场景：第一次搭建数据库，当前库里还没有完整业务表结构
-- 如果你已经有旧版 `articles` 表，想升级到当前结构，请执行 `migrate_article_schema.sql`

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
  '这是一篇全栈测试文章，用来验证搜索、草稿和分类能力。',
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
