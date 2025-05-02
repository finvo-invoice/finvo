# Finvo - Business Finance Management Platform

Finvo is a comprehensive business finance management platform designed to help businesses manage invoices, clients, project profiles, and company information efficiently.

## Features

- **Invoice Management**: Create, edit, download and delete invoices
- **Client Management**: Store and manage client information
- **Project Profiles**: Track and manage project details
- **Company Profiles**: Maintain company information
- **User Authentication**: Secure user authentication with Supabase
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF Generation**: PDFKit
- **Payment Processing**: Stripe

## Environment Setup

### Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- Supabase account
- Stripe account (for payment processing)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration (if using payment features)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Secret (for auth)
JWT_SECRET=your_jwt_secret
```

For the frontend, create a `.env` file in the `frontend` directory:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5001
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/finvo-invoice/finvooo.git
   cd finvooo
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies:
   ```bash
   npm run install-client
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000 with the backend running at http://localhost:5001.

## Deployment

### Vercel Deployment

The project includes a `vercel.json` configuration file for deploying to Vercel:

1. Push your code to GitHub
2. Create a new project in Vercel
3. Link your GitHub repository
4. Configure the required environment variables in Vercel's dashboard
5. Deploy the project

### Environment Variables for Production

Ensure you set these environment variables in your Vercel project:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (if using Stripe)
- `STRIPE_WEBHOOK_SECRET` (if using Stripe webhooks)
- `JWT_SECRET`
- `NODE_ENV=production`

For the frontend, set:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL` (this should be your deployed backend URL)

## Project Structure

```
finvo/
├── backend/               # Node.js backend
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── server.js          # Express server setup
│
├── frontend/              # React frontend
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── config/        # Frontend configuration
│       ├── contexts/      # React contexts (auth, etc.)
│       ├── pages/         # Page components
│       └── App.js         # Main App component
│
├── .env                   # Environment variables
├── .gitignore             # Git ignore configuration
├── package.json           # Project dependencies and scripts
└── vercel.json            # Vercel deployment configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 