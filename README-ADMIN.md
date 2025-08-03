# Tixle Admin - Theater Management System

A comprehensive mobile admin application for theater staff to manage events, scan tickets, and monitor performance. Built with React Native and Expo.

## 🎭 Overview

Tixle Admin transforms your existing event app into a powerful theater management system designed specifically for theater staff and administrators. The app provides real-time ticket verification, event management, and comprehensive reporting capabilities.

## ✨ Key Features

### 🎫 Ticket Scanner

- **QR Code Scanning**: Instant ticket verification using device camera
- **Manual Entry**: Backup ticket code entry for troubleshooting
- **Real-time Validation**: Immediate verification with fraud detection
- **Duplicate Detection**: Prevents ticket reuse and unauthorized access
- **Offline Mode**: Basic scanning capabilities when internet is limited

### 📊 Event Management

- **Live Event Monitoring**: Real-time attendee tracking and capacity management
- **Event Status**: Track upcoming, live, and completed events
- **Attendee Analytics**: Monitor attendance rates and patterns
- **Quick Actions**: Send notifications and emergency alerts
- **Search & Filter**: Easily find and manage specific events

### 📈 Reports & Analytics

- **Performance Metrics**: Revenue, attendance, and verification statistics
- **Time-based Reports**: Daily, weekly, monthly, and custom date ranges
- **Event Performance**: Individual event analysis and comparisons
- **Export Capabilities**: CSV and JSON data export for external analysis
- **Visual Dashboards**: Charts and graphs for quick insights

### 🚨 Emergency Features

- **Emergency Alerts**: Instant notifications to all event attendees
- **System Status**: Monitor app and service health
- **Quick Communication**: Direct messaging capabilities

## 🏗️ Technical Architecture

### Database Schema Extensions

The app extends the existing event database with admin-specific tables:

```sql
-- Enhanced Bookings Table
ALTER TABLE bookings ADD COLUMN ticket_code VARCHAR(50) UNIQUE;
ALTER TABLE bookings ADD COLUMN qr_code TEXT;
ALTER TABLE bookings ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN verified_by UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN seat_number VARCHAR(20);
ALTER TABLE bookings ADD COLUMN ticket_type VARCHAR(20) DEFAULT 'general';

-- Ticket Verifications Table
CREATE TABLE ticket_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  admin_id UUID REFERENCES auth.users(id),
  event_id UUID REFERENCES events(id),
  verified_at TIMESTAMP DEFAULT NOW(),
  verification_method VARCHAR(20) DEFAULT 'qr_scan',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Roles Table
CREATE TABLE admin_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50) DEFAULT 'scanner',
  permissions JSONB,
  assigned_events UUID[],
  theater_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router with file-based routing
- **State Management**: Zustand for global state
- **Authentication**: Supabase Auth with email/password
- **Database**: Supabase (PostgreSQL)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Camera**: Expo Camera & BarCode Scanner
- **Icons**: Ionicons from Expo Vector Icons

## 📱 App Structure

```
app/
├── _layout.tsx                 # Root layout with auth routing
├── index.tsx                   # Admin welcome screen
├── (auth)/
│   ├── _layout.tsx            # Auth layout
│   └── login.tsx              # Admin login screen
└── (tabs)/
    ├── _layout.tsx            # Tab navigation layout
    ├── dashboard.tsx          # Admin dashboard overview
    ├── scanner.tsx            # QR code ticket scanner
    ├── events.tsx             # Event management
    ├── reports.tsx            # Analytics and reports
    └── profile.tsx            # Admin profile and settings

src/
├── hooks/
│   ├── useAuth.ts             # Authentication logic
│   ├── useEvents.ts           # Event management
│   ├── useTicketVerification.ts # Ticket scanning logic
│   └── useAdminReports.ts     # Report generation
├── components/
│   ├── ui/                    # Reusable UI components
│   └── scanner/               # Scanner-specific components
├── types/
│   └── database.ts            # TypeScript interfaces
└── lib/
    └── supabase.ts            # Database configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator or physical device
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd tixle-mobile-admin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the SQL scripts above in your Supabase dashboard to create the admin tables.

5. **Start the development server**

   ```bash
   npm start
   ```

## 🎯 Usage Guide

### For Theater Administrators

1. **Initial Setup**
   - Create admin accounts in Supabase Auth
   - Assign admin roles in the database
   - Configure event permissions

2. **Daily Operations**
   - Monitor dashboard for today's events
   - Use scanner for ticket verification
   - Check reports for attendance patterns
   - Send notifications as needed

3. **Event Management**
   - Track live events in real-time
   - Monitor capacity and attendance
   - Handle emergency situations
   - Generate post-event reports

### For Technical Staff

1. **Deployment**
   - Build for production using `expo build`
   - Deploy to app stores or internal distribution
   - Configure push notifications
   - Set up monitoring and analytics

2. **Maintenance**
   - Monitor app performance
   - Update dependencies regularly
   - Backup database regularly
   - Review security settings

## 🔒 Security Features

- **Role-based Access**: Different permission levels for staff
- **Secure Authentication**: Supabase Auth with session management
- **Encrypted Data**: All sensitive data encrypted in transit and at rest
- **Audit Trails**: Complete verification history and admin actions
- **Device Security**: Camera permissions and secure storage

## 📊 Analytics & Reporting

### Available Reports

- **Daily Summary**: Verification counts, revenue, attendance
- **Event Performance**: Individual event analysis
- **Staff Performance**: Admin verification statistics
- **Financial Reports**: Revenue tracking and trends
- **Attendance Patterns**: Peak times and capacity utilization

### Export Options

- **CSV Format**: For Excel and data analysis tools
- **JSON Format**: For custom integrations
- **Date Ranges**: Custom time periods for analysis
- **Automated Reports**: Scheduled email reports (future feature)

## 🛠️ Customization

### Adding New Features

1. **New Admin Role**

   ```typescript
   // Add to admin_roles table
   INSERT INTO admin_roles (user_id, role, permissions) 
   VALUES (user_id, 'new_role', '{"scan": true, "reports": false}');
   ```

2. **Custom Reports**

   ```typescript
   // Extend useAdminReports hook
   const generateCustomReport = async (criteria) => {
     // Custom report logic
   };
   ```

3. **Additional Verification Methods**

   ```typescript
   // Add to verification_method enum
   'nfc' | 'manual' | 'qr_scan' | 'new_method'
   ```

## 📱 Platform Support

- **iOS**: iOS 13+
- **Android**: Android 6.0+ (API level 23)
- **Web**: Progressive Web App support (limited camera features)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

### v1.0.0 (Current)

- Initial admin app release
- QR code scanning
- Basic event management
- Report generation
- Admin authentication

### Planned Features

- Push notifications
- Offline synchronization
- Advanced analytics
- Multi-theater support
- API integrations

---

**Built for theater professionals by developers who understand the entertainment industry.**
