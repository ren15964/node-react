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

CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `content` TEXT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_articles_deleted_created` (`deleted_at`, `created_at`),
  KEY `idx_articles_author_id` (`author_id`),
  CONSTRAINT `fk_articles_author`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`username`, `password`)
SELECT 'admin', '$2b$10$Zpvse.MS0A.aQL0mjCZHeOWSab7Y9FR4mwAUWCHDTYl8.P.bEUco2'
WHERE NOT EXISTS (
  SELECT 1 FROM `users` WHERE `username` = 'admin'
);

INSERT INTO `articles` (`title`, `content`, `author_id`)
SELECT
  'Node.js 入门',
  '这是一篇初始化测试文章，用来验证文章列表接口是否正常。',
  u.id
FROM `users` u
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = 'Node.js 入门'
  );

INSERT INTO `articles` (`title`, `content`, `author_id`)
SELECT
  'React 项目记录',
  '这是一篇 React 测试文章，用来验证分页、详情和编辑接口。',
  u.id
FROM `users` u
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = 'React 项目记录'
  );

INSERT INTO `articles` (`title`, `content`, `author_id`)
SELECT
  '全栈开发备忘',
  '这是一篇全栈测试文章，用来验证搜索关键字功能。',
  u.id
FROM `users` u
WHERE u.username = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM `articles` WHERE `title` = '全栈开发备忘'
  );
