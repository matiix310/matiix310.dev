CREATE TABLE `avalon_auth_relations` (
	`source_id` varchar(20) NOT NULL,
	`destination_id` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `source_to_destination_pk` PRIMARY KEY(`source_id`,`destination_id`)
);
--> statement-breakpoint
ALTER TABLE `avalon_auth_relations` ADD CONSTRAINT `avalon_auth_relations_source_id_avalon_devices_id_fk` FOREIGN KEY (`source_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_relations` ADD CONSTRAINT `avalon_auth_relations_destination_id_avalon_devices_id_fk` FOREIGN KEY (`destination_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;