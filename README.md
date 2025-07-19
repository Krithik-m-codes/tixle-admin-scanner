# Tixle Event Scanner Admin App

A React Native admin app built with Expo Router for event management and QR code scanning. Features Google authentication via Supabase and a Next.js-like app router structure.

## Features

- 🔐 Google Sign-In with Supabase Auth
- 📱 QR Code Scanner for attendee check-ins
- 📊 Event management dashboard
- 👥 Attendee tracking and management
- 🎨 Beautiful UI with Tailwind CSS (NativeWind)
- 🧭 Next.js-like app router structure with Expo Router

## Project Structure

```
app/
├── (auth)/                 # Authentication pages
│   ├── _layout.tsx        # Auth layout
│   ├── index.tsx          # Welcome page
│   └── login.tsx          # Google sign-in page
├── (dashboard)/           # Main app pages (requires auth)
│   ├── _layout.tsx        # Tab navigation layout
│   ├── index.tsx          # Dashboard home
│   ├── events.tsx         # Events list
│   ├── scan.tsx           # QR scanner page
│   └── profile.tsx        # User profile
├── auth/
│   └── callback.tsx       # OAuth callback handler
├── event/
│   └── [id].tsx          # Dynamic event detail page
├── scanner.tsx           # Modal QR scanner
└── _layout.tsx           # Root layout with auth guard

components/
├── Button.tsx            # Reusable button component
├── Container.tsx         # Safe area container
├── HeaderButton.tsx      # Header button component
├── QRScanner.tsx         # QR code scanner component
└── TabBarIcon.tsx        # Tab bar icons

hooks/
└── useAuth.ts           # Authentication hook

store/
└── store.ts             # Zustand state management

utils/
└── supabase.ts          # Supabase client and auth functions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Setup Supabase

1. Create a new Supabase project
2. Enable Google OAuth in Authentication > Providers
3. Add redirect URL: `tixle-mobile-admin://auth/callback`
4. Set up your database tables (see Database Schema section)

### 4. Run the App

```bash
# Start the development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## Database Schema

Create these tables in your Supabase database:

### Events Table

```sql
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date date not null,
  location text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);
```

### Attendees Table

```sql
create table attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  name text not null,
  email text not null,
  checked_in boolean default false,
  check_in_time timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Key Features

### Authentication Flow

- Users sign in with Google via Supabase Auth
- App automatically redirects based on authentication state
- Secure session management with persistent storage

### QR Code Scanning

- Camera permission handling
- Real-time barcode scanning
- Support for JSON-formatted attendee data
- Manual check-in processing

### Event Management

- Event listing and detail views
- Attendee tracking and status
- Check-in statistics and reporting

## Technologies Used

- **Expo Router** - File-based routing system
- **Supabase** - Backend as a Service (Auth + Database)
- **NativeWind** - Tailwind CSS for React Native
- **Zustand** - State management
- **Expo Camera** - QR code scanning
- **TypeScript** - Type safety

## Development

### Code Style

- ESLint and Prettier configured
- Tailwind CSS classes for styling
- TypeScript for type safety

### Scripts

```bash
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run prebuild      # Expo prebuild
```

## Deployment

1. Configure EAS Build (Expo Application Services)
2. Set up production environment variables
3. Build for iOS/Android app stores

## License

Private - All rights reserved
