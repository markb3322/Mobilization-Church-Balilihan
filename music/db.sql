-- ============================================================
-- 1. DROP OLD TABLE IF EXISTS (FRESH START)
-- ============================================================
DROP TABLE IF EXISTS music_lineups CASCADE;

-- ============================================================
-- 2. CREATE music_lineups TABLE
-- ============================================================
CREATE TABLE music_lineups (
    id BIGSERIAL PRIMARY KEY,
    lineup_id TEXT UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    worship_leader TEXT NOT NULL,
    service_date DATE NOT NULL,
    backup_singers TEXT[] DEFAULT '{}',
    guitarist TEXT,
    drummer TEXT,
    bassist TEXT,
    keyboardist TEXT,
    opening_song TEXT,
    welcome_song TEXT,
    praise_songs TEXT[] DEFAULT '{}',
    worship_songs TEXT[] DEFAULT '{}',
    closing_song TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. CREATE INDEXES FOR BETTER PERFORMANCE
-- ============================================================
CREATE INDEX idx_music_lineups_user_id ON music_lineups(user_id);
CREATE INDEX idx_music_lineups_lineup_id ON music_lineups(lineup_id);
CREATE INDEX idx_music_lineups_service_date ON music_lineups(service_date);
CREATE INDEX idx_music_lineups_worship_leader ON music_lineups(worship_leader);

-- ============================================================
-- 4. CREATE AUTO-UPDATE TIMESTAMP FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. CREATE TRIGGER FOR AUTO-UPDATING updated_at
-- ============================================================
DROP TRIGGER IF EXISTS trigger_update_music_lineups_updated_at ON music_lineups;
CREATE TRIGGER trigger_update_music_lineups_updated_at
    BEFORE UPDATE ON music_lineups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE music_lineups ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. DROP EXISTING POLICIES IF ANY
-- ============================================================
DROP POLICY IF EXISTS "users_select_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_insert_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_update_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_delete_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "admin_full_access_lineups" ON music_lineups;

-- ============================================================
-- 8. CREATE RLS POLICIES FOR INDIVIDUAL USER ACCESS
--    (Each user can only see, insert, update, delete their own data)
-- ============================================================

-- Policy: Users can only SELECT their own lineups
CREATE POLICY "users_select_own_lineups" ON music_lineups
    FOR SELECT
    TO public
    USING (user_id::TEXT = current_setting('app.current_user_id', true));

-- Policy: Users can only INSERT their own lineups
CREATE POLICY "users_insert_own_lineups" ON music_lineups
    FOR INSERT
    TO public
    WITH CHECK (user_id::TEXT = current_setting('app.current_user_id', true));

-- Policy: Users can only UPDATE their own lineups
CREATE POLICY "users_update_own_lineups" ON music_lineups
    FOR UPDATE
    TO public
    USING (user_id::TEXT = current_setting('app.current_user_id', true));

-- Policy: Users can only DELETE their own lineups
CREATE POLICY "users_delete_own_lineups" ON music_lineups
    FOR DELETE
    TO public
    USING (user_id::TEXT = current_setting('app.current_user_id', true));

-- ============================================================
-- 9. OPTIONAL: ADMIN FULL ACCESS POLICY
--    (Uncomment if you have users with 'admin' role)
-- ============================================================
-- CREATE POLICY "admin_full_access_lineups" ON music_lineups
--     FOR ALL
--     TO public
--     USING (EXISTS (
--         SELECT 1 FROM church_users 
--         WHERE id::TEXT = current_setting('app.current_user_id', true) 
--         AND role = 'admin'
--     ));

-- ============================================================
-- 10. HELPER FUNCTION TO SET CURRENT USER ID
--     (Call this after login: SELECT set_app_current_user(user_id))
-- ============================================================
CREATE OR REPLACE FUNCTION set_app_current_user(user_id BIGINT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 11. VERIFY TABLE CREATION
-- ============================================================
SELECT 
    table_name,
    'Table created successfully' as status
FROM information_schema.tables 
WHERE table_name = 'music_lineups';

-- ============================================================
-- 12. SHOW ALL POLICIES FOR VERIFICATION
-- ============================================================
SELECT 
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'music_lineups';

-- ============================================================
-- 13. SAMPLE INSERT FOR TESTING (Optional)
-- ============================================================
-- INSERT INTO music_lineups (lineup_id, user_id, worship_leader, service_date, backup_singers, praise_songs, worship_songs)
-- VALUES ('LINEUP-2026-00001', 1, 'John Dela Cruz', '2026-05-10', ARRAY['Jane Smith', 'Maria Santos'], ARRAY['What A Beautiful Name', 'Way Maker'], ARRAY['Great Are You Lord', 'How Great Is Our God']);

-- ============================================================
-- ALTERNATIVE RLS USING SUPABASE AUTH (auth.uid())
-- ============================================================

-- Drop previous policies
DROP POLICY IF EXISTS "users_select_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_insert_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_update_own_lineups" ON music_lineups;
DROP POLICY IF EXISTS "users_delete_own_lineups" ON music_lineups;

-- Create policies using auth.uid()
CREATE POLICY "users_select_own_lineups" ON music_lineups
    FOR SELECT
    USING (user_id::TEXT = auth.uid());

CREATE POLICY "users_insert_own_lineups" ON music_lineups
    FOR INSERT
    WITH CHECK (user_id::TEXT = auth.uid());

CREATE POLICY "users_update_own_lineups" ON music_lineups
    FOR UPDATE
    USING (user_id::TEXT = auth.uid());

CREATE POLICY "users_delete_own_lineups" ON music_lineups
    FOR DELETE
    USING (user_id::TEXT = auth.uid());