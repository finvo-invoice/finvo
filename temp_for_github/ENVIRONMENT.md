# Environment Variables for Finvo

## Backend Environment Variables (.env in root directory)
```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Server Configuration
PORT=5001
NODE_ENV=development

# Auth
JWT_SECRET=your_jwt_secret
```

## Frontend Environment Variables (.env in frontend directory)
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5001
```

## Production Environment Variables (Vercel)
For production deployment on Vercel, you need to set these environment variables in your Vercel project settings:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (if using Stripe)
- `STRIPE_WEBHOOK_SECRET` (if using Stripe webhooks)
- `JWT_SECRET`
- `NODE_ENV=production`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL` (this should be your deployed backend URL) 