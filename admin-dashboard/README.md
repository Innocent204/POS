# POS Stock Management Admin Dashboard

A comprehensive admin dashboard for managing POS stock, built with Next.js 14, TypeScript, and Tailwind CSS. This dashboard complements the Flutter mobile app and provides a web interface for administrators to manage inventory, branches, sales, and analytics.

## Features

### 🏠 Dashboard
- Real-time statistics overview
- Recent activity timeline
- Quick action buttons
- Key performance indicators

### 📦 Inventory Management
- Product catalog management
- Stock level monitoring
- Low stock alerts
- Multi-branch inventory tracking

### 🏪 Branch Management
- Multiple branch support
- Branch-specific inventory
- Inter-branch stock transfers

### 💰 Sales Management
- Sales transaction tracking
- Revenue analytics
- Customer management
- Payment processing

### 📊 Analytics & Reports
- Sales analytics
- Inventory reports
- Branch performance comparison
- Export capabilities

### 👥 User Management
- Role-based access control
- User authentication
- Permission management

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Headless UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Login

Use the following credentials for demo access:
- **Email**: admin@pos.com
- **Password**: admin123

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Login page
│   └── page.tsx          # Dashboard page
├── components/
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard specific components
│   ├── layout/           # Layout components
│   └── ui/              # Reusable UI components
├── lib/
│   ├── api.ts            # API client configuration
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
```

## API Integration

The dashboard is designed to work with the existing backend API used by the Flutter mobile app. The API endpoints are configured in `src/lib/api.ts`:

- Base URL: `http://165.227.119.71/api/v1`
- Authentication: JWT Bearer tokens
- Endpoints: Auth, Branches, Products, Stock, Transfers, Sales, Dashboard, Reports, Users

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=http://165.227.119.71/api/v1
```

## Key Components

### Layout System
- **Sidebar**: Navigation menu with all main sections
- **Header**: User profile, notifications, and mobile menu toggle
- **AuthGuard**: Protects routes requiring authentication

### Dashboard Components
- **StatCard**: Display key metrics with trend indicators
- **RecentActivity**: Timeline of recent system activities
- **QuickActions**: Fast access to common tasks

### Authentication
- JWT-based authentication
- Token refresh handling
- Protected routes
- Automatic logout on token expiration

## Mobile Responsiveness

The dashboard is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [ ] Mobile app companion
