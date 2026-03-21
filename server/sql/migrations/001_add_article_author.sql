USE `fullstack_blog`;

ALTER TABLE `articles`
  ADD COLUMN `author_id` INT UNSIGNED NULL AFTER `content`;

UPDATE `articles`
SET `author_id` = (
  SELECT `id` FROM `users` WHERE `username` = 'admin' LIMIT 1
)
WHERE `author_id` IS NULL;

ALTER TABLE `articles`
  MODIFY COLUMN `author_id` INT UNSIGNED NOT NULL,
  ADD KEY `idx_articles_author_id` (`author_id`),
  ADD CONSTRAINT `fk_articles_author`
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`);
