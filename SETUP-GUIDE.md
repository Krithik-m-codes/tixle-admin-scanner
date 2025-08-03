# Tixle Admin Setup Guide

## 🚀 Quick Start for Theater Administrators

This guide will help you set up and configure the Tixle Admin app for your theater operations.

## ⚡ Prerequisites

Before you begin, ensure you have:

- Access to your Supabase dashboard
- Admin credentials for your theater system
- Mobile device with camera capability (iOS 13+ or Android 6.0+)

## 📋 Step-by-Step Setup

### Step 1: Database Configuration

1. **Access Supabase Dashboard**
   - Log into your Supabase project
   - Navigate to the SQL Editor

2. **Run Migration Script**
   - Copy the contents of `database-migration.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify Setup**

   ```sql
   -- Check if tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('ticket_verifications', 'admin_roles', 'theaters');
   ```

### Step 2: Create Admin Accounts

1. **Create User Accounts in Supabase Auth**
   - Go to Authentication > Users in Supabase
   - Click "Add User"
   - Enter admin email and temporary password
   - Repeat for each admin staff member

2. **Assign Admin Roles**

   ```sql
   -- Example: Create a super admin
   INSERT INTO admin_roles (user_id, role, permissions) 
   VALUES (
     '[user-uuid-from-auth]',
     'super_admin',
     '{"scan": true, "events": true, "reports": true, "admin": true}'::jsonb
   );

   -- Example: Create a scanner role
   INSERT INTO admin_roles (user_id, role, permissions)
   VALUES (
     '[user-uuid-from-auth]',
     'scanner', 
     '{"scan": true, "events": false, "reports": false, "admin": false}'::jsonb
   );
   ```

### Step 3: Theater Information Setup

1. **Add Your Theater Details**

   ```sql
   INSERT INTO theaters (name, address, city, capacity, contact_email, contact_phone)
   VALUES (
     'Your Theater Name',
     'Theater Address',
     'City Name',
     500,  -- seating capacity
     'admin@yourtheater.com',
     '+1-555-0123'
   );
   ```

2. **Update Admin Roles with Theater Assignment**

   ```sql
   UPDATE admin_roles 
   SET theater_id = '[theater-uuid]'
   WHERE user_id = '[admin-user-uuid]';
   ```

### Step 4: Existing Data Migration

If you have existing bookings that need ticket codes:

```sql
-- Generate ticket codes for existing bookings
UPDATE bookings 
SET ticket_code = generate_ticket_code()
WHERE ticket_code IS NULL;

-- Update ticket types based on price or other criteria
UPDATE bookings 
SET ticket_type = CASE 
  WHEN amount_paid >= 100 THEN 'vip'
  WHEN amount_paid >= 50 THEN 'premium'
  ELSE 'general'
END;
```

## 👥 Admin Role Definitions

### Super Admin

- **Permissions**: Full access to all features
- **Use Case**: Theater managers, IT administrators
- **Access**: Scanner, Events, Reports, User Management

### Event Admin  

- **Permissions**: Event management and reporting
- **Use Case**: Event coordinators, marketing managers
- **Access**: Scanner, Events, Reports

### Scanner

- **Permissions**: Ticket verification only
- **Use Case**: Door staff, ushers, security
- **Access**: Scanner only

### Theater Manager

- **Permissions**: Full operational access except user management
- **Use Case**: Operations managers, supervisors
- **Access**: Scanner, Events, Reports

## 📱 Mobile App Installation

### For Development/Testing

1. Install Expo Go on your device
2. Scan the QR code from the development server
3. Log in with admin credentials

### For Production Deployment

1. Build the app using Expo Application Services (EAS)
2. Distribute through your organization's app distribution method
3. Or deploy to app stores with enterprise account

## 🔧 Configuration Options

### Environment Variables

Create a `.env` file in your project:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
EXPO_PUBLIC_THEATER_NAME=Your Theater Name
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourtheater.com
```

### App Configuration

Update `app.json` for your theater:

```json
{
  "expo": {
    "name": "Your Theater Admin",
    "slug": "your-theater-admin",
    "icon": "./assets/your-theater-icon.png",
    "splash": {
      "image": "./assets/your-theater-splash.png"
    }
  }
}
```

## 🎫 Ticket Code Management

### Automatic Generation

- New bookings automatically receive unique 8-character codes
- Codes are alphanumeric and case-insensitive
- QR codes can be generated client-side or server-side

### Manual Assignment

For special cases, you can manually assign ticket codes:

```sql
UPDATE bookings 
SET ticket_code = 'SPECIAL1'
WHERE id = '[booking-uuid]';
```

### Bulk Operations

```sql
-- Mark all tickets for an event as VIP
UPDATE bookings 
SET ticket_type = 'vip'
WHERE event_id = '[event-uuid]';

-- Generate codes for a specific event
UPDATE bookings 
SET ticket_code = generate_ticket_code()
WHERE event_id = '[event-uuid]' AND ticket_code IS NULL;
```

## 📊 Testing the Setup

### 1. Create Test Data

```sql
-- Create a test event
INSERT INTO events (title, description, start_date, end_date, location, price, max_attendees)
VALUES (
  'Test Event',
  'Testing admin functionality',
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '3 hours', 
  'Main Theater',
  25.00,
  100
);

-- Create test bookings
INSERT INTO bookings (event_id, user_id, amount_paid, payment_status)
VALUES 
  ('[event-uuid]', '[user-uuid]', 25.00, 'completed'),
  ('[event-uuid]', '[user-uuid]', 25.00, 'completed');
```

### 2. Test Admin Login

1. Open the admin app
2. Log in with admin credentials
3. Verify dashboard shows test data

### 3. Test Ticket Scanning

1. Generate a QR code for a test ticket
2. Use the scanner feature
3. Verify the ticket is marked as verified

## 🛠️ Troubleshooting

### Common Issues

**Login Problems**

- Verify user exists in Supabase Auth
- Check admin_roles table has entry for user
- Ensure permissions are set correctly

**Scanner Not Working**

- Check camera permissions
- Verify QR code format is correct
- Test with manual ticket code entry

**Database Errors**

- Check RLS policies are enabled
- Verify foreign key relationships
- Review Supabase logs for detailed errors

### Support Commands

```sql
-- Check admin user setup
SELECT 
  u.email,
  ar.role,
  ar.permissions,
  ar.is_active
FROM auth.users u
JOIN admin_roles ar ON u.id = ar.user_id
WHERE u.email = 'admin@yourtheater.com';

-- View recent verifications
SELECT 
  tv.*,
  b.ticket_code,
  e.title as event_title
FROM ticket_verifications tv
JOIN bookings b ON tv.booking_id = b.id
JOIN events e ON tv.event_id = e.id
ORDER BY tv.verified_at DESC
LIMIT 10;

-- Check event verification status
SELECT * FROM event_verification_summary
WHERE event_id = '[your-event-uuid]';
```

## 📞 Support & Maintenance

### Regular Maintenance

- Monitor verification logs weekly
- Update admin permissions as needed
- Clean up old verification data (optional)
- Review security settings monthly

### Performance Optimization

```sql
-- Run monthly to clean old verification logs
SELECT cleanup_old_verifications(90); -- Keep 90 days

-- Analyze table performance
ANALYZE ticket_verifications;
ANALYZE admin_roles;
ANALYZE bookings;
```

### Backup Recommendations

- Daily database backups through Supabase
- Export critical verification data weekly
- Maintain admin user list separately

## 🎉 You're Ready

Once you've completed these steps:

1. ✅ Database is configured with admin tables
2. ✅ Admin users are created and assigned roles
3. ✅ Theater information is set up
4. ✅ Mobile app is installed and configured
5. ✅ Test tickets have been verified

Your theater is now ready to use the Tixle Admin system for efficient event management and ticket verification!

## 📞 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs for detailed error messages
3. Contact your technical support team
4. Create an issue in the project repository

---

**Happy Theater Management! 🎭**
