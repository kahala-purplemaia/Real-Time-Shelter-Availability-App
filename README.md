# Shelter Bed Availability App

A real-time web application for tracking emergency shelter bed availability. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Public Dashboard
- Real-time shelter bed availability
- Shelter information including policies (pets, families, sobriety requirements)
- Contact information for referrals
- Interactive map view of shelter locations
- Mobile-responsive design

### Staff Dashboard
- Secure authentication for shelter staff
- Update bed availability in real-time
- Manage shelter policies and information
- Track update timestamps and staff attribution

## Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase account and project

### Setup

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon public key
   - Copy `.env.example` to `.env` and fill in your Supabase credentials

3. **Set up the database**
   - The migration file will create the shelters table with sample data
   - Make sure to run the migration in your Supabase dashboard

4. **Create a staff user**
   - In your Supabase dashboard, go to Authentication > Users
   - Create a new user with email: `staff@shelter.org` and password: `password123`
   - This will allow you to test the staff login functionality

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### For the Public
- Visit the main dashboard to see all shelter availability
- Toggle between list and map views
- Contact shelters directly using provided phone numbers and emails

### For Shelter Staff
- Go to `/staff/login` to access the staff dashboard
- Use the demo credentials: `staff@shelter.org` / `password123`
- Update bed availability and shelter policies
- Changes are reflected in real-time on the public dashboard

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps**: Leaflet with OpenStreetMap
- **Icons**: Lucide React
- **Routing**: React Router

## Database Schema

The app uses a single `shelters` table with the following key fields:
- Basic info: name, address, contact details
- Capacity: total_beds, available_beds
- Policies: allows_pets, requires_sobriety, accepts_families
- Location: latitude, longitude for mapping
- Tracking: last_updated, updated_by

## Security Features

- Row Level Security (RLS) enabled
- Public read access for shelter information
- Authenticated write access for updates only
- Real-time updates without exposing sensitive data

## Contributing

This is a demonstration app showing how to build real-time applications with Supabase. In production, you would want to:

- Add proper user-shelter assignment relationships
- Implement more granular permissions
- Add input validation and error handling
- Include audit logging
- Add automated testing
- Implement proper deployment procedures

## License

MIT License - feel free to use this as a starting point for your own shelter management system.