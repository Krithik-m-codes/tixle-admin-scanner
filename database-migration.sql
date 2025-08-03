-- Tixle Admin Database Migration
-- Run these SQL commands in your Supabase SQL Editor

-- ============================================
-- 1. Enhanced Bookings Table for Ticket Management
-- ============================================

-- Add admin-specific columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS ticket_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS seat_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS ticket_type VARCHAR(20) DEFAULT 'general';

-- Create index for faster ticket verification lookups
CREATE INDEX IF NOT EXISTS idx_bookings_ticket_code ON bookings(ticket_code);
CREATE INDEX IF NOT EXISTS idx_bookings_verified ON bookings(is_verified);
CREATE INDEX IF NOT EXISTS idx_bookings_event_verified ON bookings(event_id, is_verified);

-- ============================================
-- 2. Ticket Verifications Table
-- ============================================

CREATE TABLE IF NOT EXISTS ticket_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  verified_at TIMESTAMP DEFAULT NOW(),
  verification_method VARCHAR(20) DEFAULT 'qr_scan' CHECK (verification_method IN ('qr_scan', 'manual', 'nfc')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verifications_admin ON ticket_verifications(admin_id);
CREATE INDEX IF NOT EXISTS idx_verifications_event ON ticket_verifications(event_id);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON ticket_verifications(verified_at);
CREATE INDEX IF NOT EXISTS idx_verifications_booking ON ticket_verifications(booking_id);

-- ============================================
-- 3. Admin Roles and Permissions Table
-- ============================================

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'scanner' CHECK (role IN ('super_admin', 'event_admin', 'scanner', 'theater_manager')),
  permissions JSONB DEFAULT '{"scan": true, "events": false, "reports": false, "admin": false}'::jsonb,
  assigned_events UUID[],
  theater_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create unique constraint for user roles
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_roles_user ON admin_roles(user_id) WHERE is_active = TRUE;

-- ============================================
-- 4. Theater Information Table (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS theaters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  capacity INTEGER,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. Functions for Ticket Code Generation
-- ============================================

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    done := NOT EXISTS(SELECT 1 FROM bookings WHERE ticket_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. Triggers for Automatic Ticket Code Generation
-- ============================================

-- Trigger function to auto-generate ticket codes
CREATE OR REPLACE FUNCTION set_ticket_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_code IS NULL THEN
    NEW.ticket_code := generate_ticket_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS trigger_set_ticket_code ON bookings;
CREATE TRIGGER trigger_set_ticket_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_code();

-- ============================================
-- 7. Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on admin tables
ALTER TABLE ticket_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;

-- Policy for ticket verifications - admins can see their own verifications
CREATE POLICY "Admin can view own verifications" ON ticket_verifications
  FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admin can create verifications" ON ticket_verifications
  FOR INSERT WITH CHECK (admin_id = auth.uid());

-- Policy for admin roles - users can view their own role
CREATE POLICY "Users can view own admin role" ON admin_roles
  FOR SELECT USING (user_id = auth.uid());

-- Policy for theaters - admins can view theaters they're assigned to
CREATE POLICY "Admins can view assigned theaters" ON theaters
  FOR SELECT USING (
    id IN (
      SELECT theater_id FROM admin_roles 
      WHERE user_id = auth.uid() AND is_active = TRUE
    )
  );

-- ============================================
-- 8. Sample Data for Testing
-- ============================================

-- Insert sample theater
INSERT INTO theaters (name, address, city, capacity) 
VALUES ('Main Theater', '123 Theater St', 'Downtown', 500)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. Views for Admin Dashboard
-- ============================================

-- View for admin verification stats
CREATE OR REPLACE VIEW admin_verification_stats AS
SELECT 
  a.user_id,
  u.email,
  COUNT(tv.id) as total_verifications,
  COUNT(CASE WHEN DATE(tv.verified_at) = CURRENT_DATE THEN 1 END) as today_verifications,
  COUNT(CASE WHEN tv.verified_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_verifications,
  MAX(tv.verified_at) as last_verification
FROM admin_roles a
LEFT JOIN auth.users u ON a.user_id = u.id
LEFT JOIN ticket_verifications tv ON a.user_id = tv.admin_id
WHERE a.is_active = TRUE
GROUP BY a.user_id, u.email;

-- View for event verification summary
CREATE OR REPLACE VIEW event_verification_summary AS
SELECT 
  e.id as event_id,
  e.title,
  e.start_date,
  e.location,
  COUNT(b.id) as total_tickets,
  COUNT(CASE WHEN b.is_verified THEN 1 END) as verified_tickets,
  COUNT(CASE WHEN b.is_verified IS FALSE THEN 1 END) as pending_tickets,
  SUM(b.amount_paid) as total_revenue,
  ROUND(
    (COUNT(CASE WHEN b.is_verified THEN 1 END)::DECIMAL / NULLIF(COUNT(b.id), 0)) * 100, 
    2
  ) as verification_rate
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id
GROUP BY e.id, e.title, e.start_date, e.location;

-- ============================================
-- 10. Cleanup Functions
-- ============================================

-- Function to cleanup old verification logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_verifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ticket_verifications 
  WHERE verified_at < CURRENT_DATE - INTERVAL '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Migration Complete
-- ============================================

-- Verify tables were created successfully
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: ticket_verifications, admin_roles, theaters';
  RAISE NOTICE 'Functions created: generate_ticket_code, set_ticket_code, cleanup_old_verifications';
  RAISE NOTICE 'Views created: admin_verification_stats, event_verification_summary';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create admin user accounts in Supabase Auth';
  RAISE NOTICE '2. Insert admin roles for your staff';
  RAISE NOTICE '3. Update existing bookings with ticket codes if needed';
END $$;
