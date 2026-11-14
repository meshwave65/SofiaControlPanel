CREATE TABLE "sofia"."arcAssessments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."arcAssessments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"taskId" integer NOT NULL,
	"agentId" integer,
	"policyId" integer NOT NULL,
	"prior" numeric(7, 6) NOT NULL,
	"posterior" numeric(7, 6) NOT NULL,
	"decision" varchar(16) NOT NULL,
	"mode" varchar(16) DEFAULT 'shadow' NOT NULL,
	"explanation" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sofia"."arcEvidence" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."arcEvidence_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"assessmentId" integer NOT NULL,
	"key" varchar(128) NOT NULL,
	"value" numeric(7, 6) NOT NULL,
	"reliability" numeric(7, 6) NOT NULL,
	"likelihoodRatio" numeric(12, 6) NOT NULL,
	"source" varchar(128) NOT NULL,
	"observedAt" timestamp NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "sofia"."arcPolicies" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sofia"."arcPolicies_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(128) NOT NULL,
	"prior" numeric(7, 6) DEFAULT '0.500000' NOT NULL,
	"allowThreshold" numeric(7, 6) DEFAULT '0.850000' NOT NULL,
	"reviewThreshold" numeric(7, 6) DEFAULT '0.550000' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"version" varchar(32) DEFAULT '0.1.0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arcPolicies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "sofia"."arcAssessments" ADD CONSTRAINT "arcAssessments_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "sofia"."tasks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."arcAssessments" ADD CONSTRAINT "arcAssessments_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "sofia"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."arcAssessments" ADD CONSTRAINT "arcAssessments_policyId_arcPolicies_id_fk" FOREIGN KEY ("policyId") REFERENCES "sofia"."arcPolicies"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sofia"."arcEvidence" ADD CONSTRAINT "arcEvidence_assessmentId_arcAssessments_id_fk" FOREIGN KEY ("assessmentId") REFERENCES "sofia"."arcAssessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "arcAssessments_taskId_idx" ON "sofia"."arcAssessments" USING btree ("taskId");--> statement-breakpoint
CREATE INDEX "arcAssessments_agentId_idx" ON "sofia"."arcAssessments" USING btree ("agentId");--> statement-breakpoint
CREATE INDEX "arcAssessments_policyId_idx" ON "sofia"."arcAssessments" USING btree ("policyId");--> statement-breakpoint
CREATE INDEX "arcAssessments_createdAt_idx" ON "sofia"."arcAssessments" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "arcEvidence_assessmentId_idx" ON "sofia"."arcEvidence" USING btree ("assessmentId");--> statement-breakpoint
CREATE INDEX "arcEvidence_key_idx" ON "sofia"."arcEvidence" USING btree ("key");--> statement-breakpoint
CREATE INDEX "arcEvidence_observedAt_idx" ON "sofia"."arcEvidence" USING btree ("observedAt");--> statement-breakpoint
CREATE INDEX "arcPolicies_enabled_idx" ON "sofia"."arcPolicies" USING btree ("enabled");