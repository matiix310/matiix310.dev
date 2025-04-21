RENAME TABLE `avalon_auth_relations` TO `avalon_auth_permissions`;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` DROP FOREIGN KEY `avalon_auth_relations_source_id_avalon_devices_id_fk`;
--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` DROP FOREIGN KEY `avalon_auth_relations_destination_id_avalon_devices_id_fk`;
--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_source_id_avalon_devices_id_fk` FOREIGN KEY (`source_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avalon_auth_permissions` ADD CONSTRAINT `avalon_auth_permissions_destination_id_avalon_devices_id_fk` FOREIGN KEY (`destination_id`) REFERENCES `avalon_devices`(`id`) ON DELETE cascade ON UPDATE no action;