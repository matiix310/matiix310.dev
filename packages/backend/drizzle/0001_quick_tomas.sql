CREATE TABLE `avalon_devices` (
	`id` varchar(20) NOT NULL,
	`name` varchar(20) NOT NULL,
	`kind` varchar(20),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `avalon_devices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avalon_fcm` (
	`device_id` varchar(20) NOT NULL,
	`token` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
ALTER TABLE `avalon_fcm` ADD CONSTRAINT `avalon_fcm_device_id_avalon_devices_id_fk` FOREIGN KEY (`device_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;