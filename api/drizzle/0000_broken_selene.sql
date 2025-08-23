CREATE TABLE `account` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`idtoken` text,
	`password` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `api_key` (
	`id` varchar(64) NOT NULL,
	`name` text,
	`start` text,
	`prefix` text,
	`key` text NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`refill_interval` int,
	`refill_amount` int,
	`last_refill_at` timestamp,
	`enabled` boolean NOT NULL,
	`rate_limit_enabled` boolean NOT NULL,
	`rate_limit_time_window` int,
	`rate_limit_max` int,
	`request_count` int NOT NULL,
	`remaining` int,
	`last_request` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	`permissions` text,
	`metadata` json,
	CONSTRAINT `api_key_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`token` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ipAdress` text,
	`userAgent` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`username` text,
	`displayUsername` text,
	`email` text NOT NULL,
	`emailVerified` boolean NOT NULL,
	`image` text,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(64) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_auth_permissions` (
	`device_id` varchar(20) NOT NULL,
	`client_id` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `device_to_client_pk` PRIMARY KEY(`device_id`,`client_id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_clients` (
	`id` varchar(20) NOT NULL,
	`name` varchar(20) NOT NULL,
	`kind` enum('web_extension','pam') NOT NULL DEFAULT 'web_extension',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_devices` (
	`id` varchar(20) NOT NULL,
	`name` varchar(20) NOT NULL,
	`kind` enum('computer','laptop','phone') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_fcm` (
	`device_id` varchar(20) NOT NULL,
	`token` varchar(150) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_fcm_device_id_unique` UNIQUE(`device_id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_logs` (
	`id` varchar(20) NOT NULL,
	`device_id` varchar(20),
	`client_id` varchar(20) NOT NULL,
	`answer` boolean,
	`kind` enum('request','answer','timeout') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_vault` (
	`id` varchar(20) NOT NULL,
	`name` varchar(20) NOT NULL,
	`uri_regex` varchar(30) NOT NULL,
	`kind` enum('username','email','password') NOT NULL,
	`content` varchar(50) NOT NULL,
	`group` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_vault_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `curl` (
	`id` varchar(20) NOT NULL,
	`fps` int,
	CONSTRAINT `curl_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_key` ADD CONSTRAINT `api_key_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_client_id_avalon_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `avalon_clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_fcm` ADD CONSTRAINT `avalon_fcm_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_logs` ADD CONSTRAINT `avalon_logs_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_logs` ADD CONSTRAINT `avalon_logs_client_id_avalon_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `avalon_clients`(`id`) ON DELETE cascade ON UPDATE no action;