CREATE TABLE `account` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`accessTokenExpiresAt` date,
	`refreshTokenExpiresAt` date,
	`scope` text,
	`idtoken` text,
	`string` text,
	`createdAt` date NOT NULL,
	`updatedAt` date NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`token` text NOT NULL,
	`expiresAt` date NOT NULL,
	`ipAdress` text,
	`userAgent` text,
	`createdAt` date NOT NULL,
	`updatedAt` date NOT NULL,
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
	`createdAt` date NOT NULL,
	`updatedAt` date NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(64) NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` date NOT NULL,
	`createdAt` date NOT NULL,
	`updatedAt` date NOT NULL,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_clients` (
	`id` varchar(20) NOT NULL,
	`name` varchar(20) NOT NULL,
	`kind` enum('web_extension','pam') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_logs` (
	`device_id` varchar(20) NOT NULL,
	`client_id` varchar(20) NOT NULL,
	`success` boolean NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `device_to_client_pk` PRIMARY KEY(`client_id`,`device_id`)
);
--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` RENAME COLUMN `source_id` TO `device_id`;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` RENAME COLUMN `destination_id` TO `client_id`;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` DROP FOREIGN KEY `avalon_auth_permissions_source_id_avalon_devices_id_fk`;
--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` DROP FOREIGN KEY `avalon_auth_permissions_destination_id_avalon_devices_id_fk`;
--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `avalon_devices` MODIFY COLUMN `kind` enum('laptop','phone') NOT NULL;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD PRIMARY KEY(`device_id`,`client_id`);--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_logs` ADD CONSTRAINT `avalon_logs_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_logs` ADD CONSTRAINT `avalon_logs_client_id_avalon_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `avalon_clients`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_client_id_avalon_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `avalon_clients`(`id`) ON DELETE cascade ON UPDATE no action;