# Financial Advisory Intelligence System (FAIS) - Web Application

A comprehensive Next.js web application providing institutional-quality financial analysis through specialized AI agents.

## Features

### 🔐 Authentication & Authorization
- Firebase Authentication with email/password and Google Sign-In
- Protected routes requiring active subscription
- User session management and automatic redirects

### 💳 Subscription Management
- Stripe integration for subscription billing
- Professional plan with full feature access
- Billing portal for subscription management
- Webhook handling for subscription status updates

### 📊 Financial Analysis Dashboard
- AI-generated financial reports from Firestore
- Search and filter functionality
- Detailed analysis views with confidence scores
- Content tagging and categorization
- Download and share capabilities

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Professional component library
- Loading states and error handling
- Mobile-optimized interface

## Architecture

### Frontend (Next.js 15)
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Firebase SDK** for client-side auth
- **Stripe SDK** for payment processing

### Backend (API Routes)
- **Next.js API Routes** for server-side logic
- **Firebase Admin SDK** for server-side operations
- **Stripe Server SDK** for subscription management
- **Firestore** for data storage

### Authentication Flow
1. User signs up/in via Firebase Auth
2. User document created/updated in Firestore
3. Subscription status tracked and validated
4. Protected routes check subscription status

### Payment Flow
1. User initiates subscription via Stripe Checkout
2. Stripe webhook updates user subscription status
3. Access granted to premium features
4. Billing portal available for management

## Environment Variables

Create `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PROJECT_ID=your_project_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Subscription Configuration
STRIPE_PRICE_ID=price_your_subscription_price_id
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Create a Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database
4. Generate service account key
5. Update environment variables

### 3. Configure Stripe
1. Create Stripe account
2. Create subscription product and price
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Update environment variables

### 4. Database Schema

#### Users Collection (`users`)
```typescript
{
  id: string;                    // Firebase Auth UID
  email: string;
  name?: string;
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled';
  subscriptionId?: string;       // Stripe subscription ID
  customerId?: string;          // Stripe customer ID
  currentPeriodEnd?: number;    // Unix timestamp
  createdAt: Date;
  updatedAt: Date;
}
```

#### Financial Analysis Collection (`financial_analysis`)
```typescript
{
  id: string;
  title: string;
  content: string;              // Full analysis content
  summary: string;              // Brief summary
  createdAt: Date;
  updatedAt: Date;
  tags: string[];               // ['technical', 'fundamental', etc.]
  analysis_type: string;        // Type of analysis
  confidence_score?: number;    // 0-1 confidence rating
  symbols?: string[];           // Stock symbols analyzed
}
```

### 5. Run Development Server
```bash
npm run dev
```

## Pages & Routes

### Public Routes
- `/` - Landing page with features overview
- `/login` - Authentication page (sign in/up)
- `/pricing` - Subscription plans and pricing
- `/contact` - Contact information and form

### Protected Routes
- `/dashboard` - User dashboard and subscription status
- `/analysis` - Financial analysis listing (requires subscription)
- `/analysis/[id]` - Individual analysis detail (requires subscription)

### API Routes
- `/api/user` - User management
- `/api/create-checkout-session` - Stripe checkout
- `/api/create-portal-session` - Stripe billing portal
- `/api/webhooks/stripe` - Stripe webhook handler
- `/api/financial-analysis` - Analysis listing
- `/api/financial-analysis/[id]` - Individual analysis

## Development Guidelines

### Authentication
- Use `useAuth()` hook for auth state
- Check `user` and `hasActiveSubscription` before rendering protected content
- Handle loading states appropriately

### Subscription Management
- Use `useSubscription()` hook for subscription operations
- Always verify subscription status server-side for sensitive operations
- Handle webhook events to keep subscription status in sync

### Error Handling
- Implement proper error boundaries
- Show user-friendly error messages
- Log errors for debugging

### Security
- Never expose sensitive data in client-side code
- Validate all inputs server-side
- Use Firebase Auth tokens for API authentication
- Implement proper CORS policies

## Deployment

### Prerequisites
1. Firebase project configured
2. Stripe account with products set up
3. Domain for webhook endpoints

### Environment Setup
1. Update `NEXTAUTH_URL` to production domain
2. Configure Stripe webhook with production URL
3. Set all required environment variables

### Build & Deploy
```bash
npm run build
npm start
```

## Important Disclaimers

⚠️ **Educational Use Only**: This system provides AI-generated analysis for educational and informational purposes only. All output is:

- **NOT financial advice** or investment insights
- **NOT offers to buy or sell** securities or financial instruments
- **NOT guaranteed** for accuracy, completeness, or profitability
- **FOR educational exploration** and research enhancement only

Users must conduct independent research and consult qualified financial advisors before making investment decisions.

## Support

For technical support or questions about the Financial Advisory Intelligence System, please contact our support team or refer to the documentation.

---

**Built with institutional standards for educational and research purposes.**
