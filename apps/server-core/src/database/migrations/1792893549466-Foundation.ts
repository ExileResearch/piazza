import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Foundation1792893549466 implements MigrationInterface {
  name = 'Foundation1792893549466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "email" character varying(254) NOT NULL, "password_hash" character varying(1024), "email_verified_at" TIMESTAMP(3) WITH TIME ZONE, "roles" character varying(16) array NOT NULL DEFAULT '{user}', "locale" character varying(2) NOT NULL DEFAULT 'en', "theme" character varying(5) NOT NULL DEFAULT 'dark', "state" character varying(9) NOT NULL DEFAULT 'active', "closed_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "uq_users_email" UNIQUE ("email"), CONSTRAINT "ck_users_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_users_version" CHECK ("version" > 0), CONSTRAINT "ck_users_canonical_email" CHECK (email = lower(btrim(email))), CONSTRAINT "ck_users_roles" CHECK (roles = ARRAY['user']::varchar[] OR roles = ARRAY['user','admin']::varchar[] OR roles = ARRAY['admin','user']::varchar[]), CONSTRAINT "ck_users_locale" CHECK ("locale" IN ('en','fr','es','pa','zh')), CONSTRAINT "ck_users_theme" CHECK ("theme" IN ('dark','light')), CONSTRAINT "ck_users_state" CHECK ("state" IN ('active','closed','suspended')), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_tokens" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "user_id" uuid, "challenge_id" uuid NOT NULL, "purpose" character varying(16) NOT NULL, "secret_hash" character varying(1024) NOT NULL, "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "consumed_at" TIMESTAMP(3) WITH TIME ZONE, "attempt_count" integer NOT NULL DEFAULT '0', "delivery_state" character varying(7) NOT NULL DEFAULT 'pending', CONSTRAINT "uq_auth_tokens_challenge" UNIQUE ("challenge_id"), CONSTRAINT "ck_auth_tokens_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_auth_tokens_purpose" CHECK ("purpose" IN ('verify_email','login_otp','reset_password','step_up','admin_otp')), CONSTRAINT "ck_auth_tokens_delivery" CHECK ("delivery_state" IN ('pending','sent','failed','expired')), CONSTRAINT "ck_auth_tokens_attempts" CHECK (attempt_count BETWEEN 0 AND 10), CONSTRAINT "ck_auth_tokens_expiry" CHECK (expires_at > created_at), CONSTRAINT "PK_41e9ddfbb32da18c4e85e45c2fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_auth_tokens_expiry" ON "auth_tokens"  ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_auth_tokens_user" ON "auth_tokens"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "user_id" uuid NOT NULL, "refresh_token_hash" character varying(1024) NOT NULL, "family_id" uuid NOT NULL, "generation" integer NOT NULL DEFAULT '1', "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP(3) WITH TIME ZONE, "user_agent" character varying(512), "ip_hash" character varying(1024), CONSTRAINT "uq_sessions_refresh_hash" UNIQUE ("refresh_token_hash"), CONSTRAINT "uq_sessions_generation" UNIQUE ("family_id", "generation"), CONSTRAINT "ck_sessions_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_sessions_version" CHECK ("version" > 0), CONSTRAINT "ck_sessions_generation" CHECK (generation > 0), CONSTRAINT "ck_sessions_expiry" CHECK (expires_at > created_at), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_sessions_user" ON "sessions"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_sessions_family" ON "sessions"  ("family_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_sessions_expiry" ON "sessions"  ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "mfa_enrollments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "user_id" uuid NOT NULL, "encrypted_totp_secret" character varying(4096) NOT NULL, "confirmed_at" TIMESTAMP(3) WITH TIME ZONE, "recovery_code_hashes" character varying(1024) array NOT NULL, "status" character varying(8) NOT NULL DEFAULT 'pending', CONSTRAINT "uq_mfa_user" UNIQUE ("user_id"), CONSTRAINT "ck_mfa_enrollments_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_mfa_status" CHECK ("status" IN ('pending','enabled','disabled')), CONSTRAINT "ck_mfa_recovery_bound" CHECK (cardinality(recovery_code_hashes) <= 10), CONSTRAINT "PK_3c77443db949e9eb9c9a378692c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_identities" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "user_id" uuid NOT NULL, "display_name" character varying(120) NOT NULL, "biography" character varying(8000) NOT NULL DEFAULT '', "avatar_artifact_id" uuid, "modalities" character varying(5) array NOT NULL, "skills" character varying(120) array NOT NULL DEFAULT '{}', "status" character varying(9) NOT NULL DEFAULT 'active', "profile_visibility" character varying(16) NOT NULL DEFAULT 'operator_private', CONSTRAINT "uq_agents_controller" UNIQUE ("id", "user_id"), CONSTRAINT "ck_agent_identities_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_agent_identities_version" CHECK ("version" > 0), CONSTRAINT "ck_agents_status" CHECK ("status" IN ('active','paused','suspended','closed')), CONSTRAINT "ck_agents_visibility" CHECK ("profile_visibility" IN ('public','project','invited','operator_private')), CONSTRAINT "ck_agents_modalities" CHECK (cardinality(modalities) BETWEEN 1 AND 5 AND modalities <@ ARRAY['text','image','audio','video','file']::varchar[]), CONSTRAINT "ck_agents_skills" CHECK (cardinality(skills) <= 50), CONSTRAINT "PK_3b17bdec97261785c6f8a7019d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_agents_controller" ON "agent_identities"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "configuration_revisions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "agent_id" uuid NOT NULL, "sequence" integer NOT NULL, "declared" jsonb NOT NULL, "disclosure_scope" character varying(16) NOT NULL, "effective_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, CONSTRAINT "uq_configurations_sequence" UNIQUE ("agent_id", "sequence"), CONSTRAINT "uq_configurations_agent" UNIQUE ("id", "agent_id"), CONSTRAINT "ck_configuration_revisions_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_configurations_sequence" CHECK (sequence > 0), CONSTRAINT "ck_configurations_visibility" CHECK ("disclosure_scope" IN ('public','project','invited','operator_private')), CONSTRAINT "ck_configurations_declaration" CHECK (jsonb_typeof(declared) = 'object' AND octet_length(declared::text) <= 65536), CONSTRAINT "PK_db285c477aa54cd60d7d1585669" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_instances" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "agent_id" uuid NOT NULL, "user_id" uuid NOT NULL, "configuration_revision_id" uuid NOT NULL, "label" character varying(120) NOT NULL, "state" character varying(7) NOT NULL DEFAULT 'active', "last_seen_at" TIMESTAMP(3) WITH TIME ZONE, "expires_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "uq_instances_controller" UNIQUE ("id", "user_id"), CONSTRAINT "uq_instances_agent" UNIQUE ("id", "agent_id"), CONSTRAINT "ck_agent_instances_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_agent_instances_version" CHECK ("version" > 0), CONSTRAINT "ck_instances_state" CHECK ("state" IN ('active','paused','expired','revoked')), CONSTRAINT "PK_70016f72258eafff5d06fdaffb0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_instances_agent" ON "agent_instances"  ("agent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_instances_configuration" ON "agent_instances"  ("configuration_revision_id", "agent_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "agent_credentials" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "instance_id" uuid NOT NULL, "user_id" uuid NOT NULL, "key_id" uuid NOT NULL, "secret_hash" character varying(1024) NOT NULL, "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP(3) WITH TIME ZONE, "scope_version" integer NOT NULL DEFAULT '1', CONSTRAINT "uq_credentials_key" UNIQUE ("key_id"), CONSTRAINT "ck_agent_credentials_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_credentials_scope_version" CHECK (scope_version > 0), CONSTRAINT "ck_credentials_expiry" CHECK (expires_at > created_at), CONSTRAINT "PK_1fe0ccf5d2193e832d0a445fba4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_credentials_instance" ON "agent_credentials"  ("instance_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_credentials_expiry" ON "agent_credentials"  ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "permission_grants" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "agent_id" uuid NOT NULL, "instance_id" uuid, "grantor_user_id" uuid NOT NULL, "actions" character varying(40) array NOT NULL, "resource_scope" jsonb NOT NULL, "budget_caps" jsonb NOT NULL, "approval_rule" character varying(12) NOT NULL, "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP(3) WITH TIME ZONE, CONSTRAINT "ck_permission_grants_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_permission_grants_version" CHECK ("version" > 0), CONSTRAINT "ck_grants_actions" CHECK (cardinality(actions) BETWEEN 1 AND 50 AND actions <@ ARRAY['discovery.read','project.create','project.read','project.update','project.members.manage','task.create','task.read','task.update','task.volunteer','task.assign','application.withdraw','task.decide','assignment.acknowledge','assignment.heartbeat','assignment.release','assignment.submit','assignment.renew','submission.record_evidence','inquiry.create','inquiry.read','inquiry.answer','thread.post','review.submit','review.request','review.respond','verification.record','evidence.read','assessment.read','assessment.write','profile.update','configuration.create','capability.write','wall.post','wall.update','wall.delete','post.react','association.manage','social.control','feed.read','artifact.upload','artifact.read','artifact.delete','usage.report','events.read','report.create']::varchar[]), CONSTRAINT "ck_grants_scope" CHECK (jsonb_typeof(resource_scope) = 'object' AND resource_scope ? 'kind' AND COALESCE(resource_scope->>'kind','') IN ('public','controlled_agents','project','task','inquiry','agent')), CONSTRAINT "ck_grants_budget" CHECK (jsonb_typeof(budget_caps) = 'array' AND jsonb_array_length(budget_caps) <= 6), CONSTRAINT "ck_grants_approval" CHECK ("approval_rule" IN ('within_grant','per_action')), CONSTRAINT "ck_grants_expiry" CHECK (expires_at > created_at), CONSTRAINT "PK_be6ee1d795d0ac9f29a4e27a000" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_grants_agent" ON "permission_grants"  ("agent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_grants_instance" ON "permission_grants"  ("instance_id", "agent_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_grants_controller" ON "permission_grants"  ("grantor_user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_grants_expiry" ON "permission_grants"  ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "action_approvals" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "updated_at" TIMESTAMP(3) WITH TIME ZONE, "deleted_at" TIMESTAMP(3) WITH TIME ZONE, "version" integer NOT NULL DEFAULT '1', "user_id" uuid NOT NULL, "agent_id" uuid NOT NULL, "requested_action" character varying(40) NOT NULL, "target" jsonb NOT NULL, "payload_digest" character varying(64) NOT NULL, "budget" jsonb NOT NULL, "expires_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL, "decision" character varying(8) NOT NULL DEFAULT 'pending', "consumed_at" TIMESTAMP(3) WITH TIME ZONE, "intent" jsonb NOT NULL, CONSTRAINT "ck_action_approvals_id" CHECK ("id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'), CONSTRAINT "ck_action_approvals_version" CHECK ("version" > 0), CONSTRAINT "ck_approvals_action" CHECK ("requested_action" IN ('discovery.read','project.create','project.read','project.update','project.members.manage','task.create','task.read','task.update','task.volunteer','task.assign','application.withdraw','task.decide','assignment.acknowledge','assignment.heartbeat','assignment.release','assignment.submit','assignment.renew','submission.record_evidence','inquiry.create','inquiry.read','inquiry.answer','thread.post','review.submit','review.request','review.respond','verification.record','evidence.read','assessment.read','assessment.write','profile.update','configuration.create','capability.write','wall.post','wall.update','wall.delete','post.react','association.manage','social.control','feed.read','artifact.upload','artifact.read','artifact.delete','usage.report','events.read','report.create')), CONSTRAINT "ck_approvals_decision" CHECK ("decision" IN ('pending','approved','declined')), CONSTRAINT "ck_approvals_digest" CHECK (payload_digest ~ '^[a-f0-9]{64}$'), CONSTRAINT "ck_approvals_intent" CHECK (jsonb_typeof(intent) = 'object' AND octet_length(intent::text) <= 2000000), CONSTRAINT "ck_approvals_target" CHECK (jsonb_typeof(target) = 'object'), CONSTRAINT "ck_approvals_budget" CHECK (jsonb_typeof(budget) = 'array' AND jsonb_array_length(budget) <= 6), CONSTRAINT "ck_approvals_expiry" CHECK (expires_at > created_at), CONSTRAINT "ck_approvals_consumption" CHECK (consumed_at IS NULL OR decision = 'approved'), CONSTRAINT "PK_7f00243479fc19d5576e6e6b4f5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_approvals_controller" ON "action_approvals"  ("user_id", "decision") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_approvals_lookup" ON "action_approvals"  ("agent_id", "payload_digest") `,
    );
    await queryRunner.query(
      `CREATE INDEX "ix_approvals_expiry" ON "action_approvals"  ("expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" ADD CONSTRAINT "fk_auth_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mfa_enrollments" ADD CONSTRAINT "fk_mfa_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_identities" ADD CONSTRAINT "fk_agents_controller" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "configuration_revisions" ADD CONSTRAINT "fk_configurations_agent" FOREIGN KEY ("agent_id") REFERENCES "agent_identities"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_instances" ADD CONSTRAINT "fk_instances_controller" FOREIGN KEY ("agent_id", "user_id") REFERENCES "agent_identities"("id","user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_instances" ADD CONSTRAINT "fk_instances_configuration" FOREIGN KEY ("configuration_revision_id", "agent_id") REFERENCES "configuration_revisions"("id","agent_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_credentials" ADD CONSTRAINT "fk_credentials_controller" FOREIGN KEY ("instance_id", "user_id") REFERENCES "agent_instances"("id","user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_grants" ADD CONSTRAINT "fk_grants_controller" FOREIGN KEY ("agent_id", "grantor_user_id") REFERENCES "agent_identities"("id","user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_grants" ADD CONSTRAINT "fk_grants_instance" FOREIGN KEY ("instance_id", "agent_id") REFERENCES "agent_instances"("id","agent_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_approvals" ADD CONSTRAINT "fk_approvals_controller" FOREIGN KEY ("agent_id", "user_id") REFERENCES "agent_identities"("id","user_id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_approvals" DROP CONSTRAINT "fk_approvals_controller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_grants" DROP CONSTRAINT "fk_grants_instance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permission_grants" DROP CONSTRAINT "fk_grants_controller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_credentials" DROP CONSTRAINT "fk_credentials_controller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_instances" DROP CONSTRAINT "fk_instances_configuration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_instances" DROP CONSTRAINT "fk_instances_controller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "configuration_revisions" DROP CONSTRAINT "fk_configurations_agent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agent_identities" DROP CONSTRAINT "fk_agents_controller"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mfa_enrollments" DROP CONSTRAINT "fk_mfa_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "fk_sessions_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" DROP CONSTRAINT "fk_auth_tokens_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."ix_approvals_expiry"`);
    await queryRunner.query(`DROP INDEX "public"."ix_approvals_lookup"`);
    await queryRunner.query(`DROP INDEX "public"."ix_approvals_controller"`);
    await queryRunner.query(`DROP TABLE "action_approvals"`);
    await queryRunner.query(`DROP INDEX "public"."ix_grants_expiry"`);
    await queryRunner.query(`DROP INDEX "public"."ix_grants_controller"`);
    await queryRunner.query(`DROP INDEX "public"."ix_grants_instance"`);
    await queryRunner.query(`DROP INDEX "public"."ix_grants_agent"`);
    await queryRunner.query(`DROP TABLE "permission_grants"`);
    await queryRunner.query(`DROP INDEX "public"."ix_credentials_expiry"`);
    await queryRunner.query(`DROP INDEX "public"."ix_credentials_instance"`);
    await queryRunner.query(`DROP TABLE "agent_credentials"`);
    await queryRunner.query(`DROP INDEX "public"."ix_instances_configuration"`);
    await queryRunner.query(`DROP INDEX "public"."ix_instances_agent"`);
    await queryRunner.query(`DROP TABLE "agent_instances"`);
    await queryRunner.query(`DROP TABLE "configuration_revisions"`);
    await queryRunner.query(`DROP INDEX "public"."ix_agents_controller"`);
    await queryRunner.query(`DROP TABLE "agent_identities"`);
    await queryRunner.query(`DROP TABLE "mfa_enrollments"`);
    await queryRunner.query(`DROP INDEX "public"."ix_sessions_expiry"`);
    await queryRunner.query(`DROP INDEX "public"."ix_sessions_family"`);
    await queryRunner.query(`DROP INDEX "public"."ix_sessions_user"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP INDEX "public"."ix_auth_tokens_user"`);
    await queryRunner.query(`DROP INDEX "public"."ix_auth_tokens_expiry"`);
    await queryRunner.query(`DROP TABLE "auth_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
