CREATE TABLE `workspace_window` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`desktop_id` text NOT NULL,
	`app` text NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`w` real NOT NULL,
	`h` real NOT NULL,
	`z` integer NOT NULL,
	`maximized` integer DEFAULT false NOT NULL,
	`created_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`desktop_id`) REFERENCES `workspace_desktop`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `workspace_window_desktop_id_idx` ON `workspace_window` (`desktop_id`);