CREATE TABLE `two_factor` (
	`id` varchar(64) NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`secret` text,
	`backup_codes` text,
	CONSTRAINT `two_factor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user` ADD `two_factor_enabled` boolean;--> statement-breakpoint
ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;