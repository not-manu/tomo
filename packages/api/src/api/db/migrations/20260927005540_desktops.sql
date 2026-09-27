CREATE TABLE `workspace_desktop` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text NOT NULL,
	`position` integer NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workspace_desktop_workspace_id_idx` ON `workspace_desktop` (`workspace_id`,`position`);--> statement-breakpoint
INSERT INTO `workspace_desktop` (`id`, `workspace_id`, `name`, `position`, `created_by`, `created_at`, `updated_at`) SELECT lower(hex(randomblob(10))), `id`, 'Desktop 1', 0, `owner_id`, `created_at`, `created_at` FROM `workspace`;