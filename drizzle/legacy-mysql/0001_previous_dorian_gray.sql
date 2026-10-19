CREATE TABLE `activityEventTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityEventTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `activityEventTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`taskId` int,
	`eventTypeId` int NOT NULL,
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('online','offline','idle','paused') NOT NULL DEFAULT 'offline',
	`lastHeartbeat` timestamp,
	`config` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contextReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`creditsRemaining` int,
	`gitHubUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contextReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messageTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messageTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `messageTypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskId` int NOT NULL,
	`senderId` int NOT NULL,
	`typeId` int NOT NULL,
	`content` text NOT NULL,
	`parentMessageId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`cronExpression` varchar(128) NOT NULL,
	`handler` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastRun` timestamp,
	`nextRun` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduledTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `taskPriorities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`level` int NOT NULL,
	`color` varchar(32) DEFAULT '#6b7280',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskPriorities_id` PRIMARY KEY(`id`),
	CONSTRAINT `taskPriorities_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `taskStatuses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`color` varchar(32) DEFAULT '#6b7280',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskStatuses_id` PRIMARY KEY(`id`),
	CONSTRAINT `taskStatuses_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`statusId` int NOT NULL,
	`priorityId` int NOT NULL,
	`createdBy` int NOT NULL,
	`dueDate` timestamp,
	`completedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `activityLogs_agentId_idx` ON `activityLogs` (`agentId`);--> statement-breakpoint
CREATE INDEX `activityLogs_taskId_idx` ON `activityLogs` (`taskId`);--> statement-breakpoint
CREATE INDEX `activityLogs_createdAt_idx` ON `activityLogs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `agents_ownerId_idx` ON `agents` (`ownerId`);--> statement-breakpoint
CREATE INDEX `agents_status_idx` ON `agents` (`status`);--> statement-breakpoint
CREATE INDEX `contextReports_ownerId_idx` ON `contextReports` (`ownerId`);--> statement-breakpoint
CREATE INDEX `contextReports_createdAt_idx` ON `contextReports` (`createdAt`);--> statement-breakpoint
CREATE INDEX `messages_taskId_idx` ON `messages` (`taskId`);--> statement-breakpoint
CREATE INDEX `messages_senderId_idx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `messages_parentMessageId_idx` ON `messages` (`parentMessageId`);--> statement-breakpoint
CREATE INDEX `messages_createdAt_idx` ON `messages` (`createdAt`);--> statement-breakpoint
CREATE INDEX `scheduledTasks_isActive_idx` ON `scheduledTasks` (`isActive`);--> statement-breakpoint
CREATE INDEX `scheduledTasks_nextRun_idx` ON `scheduledTasks` (`nextRun`);--> statement-breakpoint
CREATE INDEX `tasks_agentId_idx` ON `tasks` (`agentId`);--> statement-breakpoint
CREATE INDEX `tasks_statusId_idx` ON `tasks` (`statusId`);--> statement-breakpoint
CREATE INDEX `tasks_createdBy_idx` ON `tasks` (`createdBy`);--> statement-breakpoint
CREATE INDEX `tasks_createdAt_idx` ON `tasks` (`createdAt`);--> statement-breakpoint
CREATE INDEX `openId_idx` ON `users` (`openId`);