-- ARC-009: defense-in-depth for the custom-auth, server-side-only SCP.
-- The application connects through the postgres owner role; it does not use
-- Supabase Auth's auth.uid() and therefore must not receive auth.uid()-based
-- policies. Client roles receive no direct access to ARC tables.

ALTER TABLE "sofia"."arcPolicies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcAssessments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sofia"."arcEvidence" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "sofia"."arcPolicies" FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE "sofia"."arcAssessments" FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE "sofia"."arcEvidence" FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "arcPolicies_server_only" ON "sofia"."arcPolicies";
CREATE POLICY "arcPolicies_server_only"
  ON "sofia"."arcPolicies"
  FOR ALL
  TO PUBLIC
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "arcAssessments_server_only" ON "sofia"."arcAssessments";
CREATE POLICY "arcAssessments_server_only"
  ON "sofia"."arcAssessments"
  FOR ALL
  TO PUBLIC
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "arcEvidence_server_only" ON "sofia"."arcEvidence";
CREATE POLICY "arcEvidence_server_only"
  ON "sofia"."arcEvidence"
  FOR ALL
  TO PUBLIC
  USING (false)
  WITH CHECK (false);
