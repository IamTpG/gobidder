# GoBidder: Online Auction Platform

## Project Overview

**GoBidder** is a modern fullstack web application designed to simulate an online auction platform.

The project is built using the **PERN Stack**:

- **PostgreSQL** (Database)
- **Express.js** (Backend Framework)
- **React** (Frontend Library)
- **Node.js** (Server Environment)

## System Requirements

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher (or **yarn**)
- **PostgreSQL**: v12.x or higher
- **Git**: For version control

---

## Frontend (FE) Setup

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

or if you're using yarn:

```bash
yarn install
```

### 3. Environment Variables Configuration

Create a `.env` file in the `client` directory (if it doesn't exist) and add the following environment variables:

```env
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# Google reCAPTCHA Site Key (for user registration)
REACT_APP_RECAPTCHA_KEY=your_recaptcha_site_key_here

# TinyMCE API Key (for rich text editor in product forms)
REACT_APP_TINYMCE_API_KEY=your_tinymce_api_key_here
```

**Note**:

- Replace `your_recaptcha_site_key_here` with your actual reCAPTCHA Site Key (see Backend Setup section for instructions on obtaining this key).
- Replace `your_tinymce_api_key_here` with your actual TinyMCE API Key (see TinyMCE Setup section below).
- The `REACT_APP_API_URL` should match your backend server URL. If your backend runs on a different port, update accordingly.

### 3.1. Setup TinyMCE API Key

TinyMCE is used as a rich text editor for product descriptions. You need to obtain a free API key from TinyMCE.

#### Step 1: Create TinyMCE Account

1. Go to [TinyMCE Account Sign Up](https://www.tiny.cloud/auth/signup/)
2. Sign up for a free account using your email address
3. Verify your email address if required

#### Step 2: Get Your API Key

1. After logging in, go to your [TinyMCE Dashboard](https://www.tiny.cloud/my-account/)
2. Navigate to **"Your API Keys"** or **"API Keys"** section (**Get your API Key**)
3. You'll see your API key (it looks like: `abcdefghijklmnopqrstuvwxyz123456`)
4. Copy the API key

#### Step 3: Update Environment Variables

Add the API key to your `client/.env` file:

```env
REACT_APP_TINYMCE_API_KEY=abcdefghijklmnopqrstuvwxyz123456
```

**Note**:

- The free tier of TinyMCE includes a warning banner. For production, consider upgrading to a paid plan or using a self-hosted version.
- Without a valid API key, the TinyMCE editor may not load properly in the product creation/editing forms.
- The API key is safe to expose in frontend code as it's domain-restricted by TinyMCE.

#### Step 4: Verify Setup

1. Start your frontend development server
2. Navigate to the product creation or editing page
3. The TinyMCE rich text editor should load in the description field
4. You should be able to format text, add images, links, and lists

### 4. Start Development Server

```bash
npm start
```

The application will start on `http://localhost:3000` by default.

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

---

## Backend (BE) Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

or if you're using yarn:

```bash
yarn install
```

### 3. Environment Variables Configuration

Create a `.env` file in the `server` directory and configure the following variables.

**Important:** This project integrates several external services (Google, Cloudinary, Brevo). You will need API keys for each.

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FE_URL=http://localhost:3000

# Database (PostgreSQL/NeonDB)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
# For example, if you are using neon, use the following format
DATABASE_URL='postgresql://neondb_owner:password@ep-cool-project.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

# You can use Google, Brevo, ... for email service
# Email Service (Brevo/SMTP)
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_FROM=noreply@gobidder.com
MAIL_USER=your_brevo_login_email
MAIL_PASS=your_brevo_smtp_key

# Google OAuth (For Social Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Security
JWT_SECRET=your_super_secret_random_string

# Google reCAPTCHA (Secret Key)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

#### 3.1. Database Setup (Prisma & NeonDB)

This project uses **Prisma ORM**. The connection string provided in the example is formatted for **NeonDB** (Serverless PostgreSQL), but any PostgreSQL database will work.

1. **Update DATABASE_URL**: Paste your connection string into the `.env` file.
2. **Generate Prisma Client**:

```bash
npx prisma generate
```

3. **Push Schema to Database**:

```bash
npx prisma db push
```

_(Or use `npx prisma migrate dev` if you are maintaining migration history)_.

#### 3.2. Setup Google OAuth (Login with Google)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Configure URIs:

- **Authorized JavaScript origins**: `http://localhost:5000` (and your production URL).
- **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`.

7. Copy the **Client ID** and **Client Secret** into your `.env`.

#### 3.3. Setup Email Service (Brevo/Sendinblue)

The application uses SMTP to send emails (e.g., welcome emails, bid notifications).

1. Create an account at [Brevo (formerly Sendinblue)](https://www.brevo.com/).
2. Navigate to **Transactional** > **Settings** > **SMTP & API**.
3. Generate a new **SMTP Key**.
4. Update the `MAIL_*` variables in your `.env`:

- `MAIL_USER`: Your Brevo login email.
- `MAIL_PASS`: The SMTP Key you just generated (NOT your login password).

### 3.4. Setup Google reCAPTCHA

#### Step 1: Register Your Site

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Sign in with your Google account
3. Click **"+"** to create a new site

#### Step 2: Configure reCAPTCHA

- **Label**: Enter a name for your site (e.g., "GoBidder")
- **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
- **Domains**:
  - For development: Add `localhost`
  - For production: Add your production domain (e.g., `yourdomain.com`, `www.yourdomain.com`)
- Accept the reCAPTCHA Terms of Service
- Click **Submit**

#### Step 3: Get Your Keys

After registration, you'll receive:

- **Site Key** (public key) - Use this in your frontend `.env` file as `REACT_APP_RECAPTCHA_KEY`
- **Secret Key** (private key) - Use this in your backend `.env` file as `RECAPTCHA_SECRET_KEY`

#### Step 4: Update Environment Variables

**Frontend** (`client/.env`):

```env
REACT_APP_RECAPTCHA_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Backend** (`server/.env`):

```env
RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

**Note**: The keys shown above are Google's test keys. Replace them with your actual keys from the reCAPTCHA admin console.

#### Step 5: Verify Setup

- The reCAPTCHA widget should appear on the registration page
- When users register, the backend will verify the reCAPTCHA token with Google's servers

### 3.5. Setup Cloudinary

#### Step 1: Create Cloudinary Account

1. Go to [Cloudinary Sign Up](https://cloudinary.com/users/register/free)
2. Sign up for a free account (or log in if you already have one)

#### Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your [Settings](https://cloudinary.com/console)
2. You'll see your **Cloudinary credentials** in tab **API Keys**:
   - **Cloud Name**: Found at the top of the dashboard
   - **API Key**: Listed in the dashboard
   - **API Secret**: Click "Reveal" to show (keep this secret!)

#### Step 3: Update Environment Variables

Add the following to your `server/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Example**:

```env
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456789
```

#### Step 4: Verify Cloudinary Configuration

The Cloudinary configuration is automatically loaded from `server/config/cloudinary.js`. The service is used for:

- Uploading product images
- Uploading transaction proof images (payment receipts, shipping proofs)
- Storing and serving images with automatic optimization

#### Step 5: Test Image Upload

1. Start your backend server
2. Try creating a product with images
3. Check your Cloudinary dashboard's **Media Library** to see uploaded images

---

### 4. Seeding the Database (Optional)

If you have a seed script setup in `prisma/seed.js`, you can populate the database with initial data:

```bash
npx prisma db seed
```

---

## 5. Running the Application

### Development Mode

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:5000` (or the port specified in your `.env` file).

#### Terminal 2 - Frontend Client

```bash
cd client
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Production Mode

#### Build Frontend

```bash
cd client
npm run build
```

#### Start Backend

```bash
cd server
npm start
```

---

## Project Structure

```
gobidder/
├── client/                 # React Frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Routing configuration
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── hooks/         # Custom React hooks
│   ├── package.json
│   └── .env              # Frontend environment variables
│
├── server/                # Express Backend
│   ├── config/           # Configuration files
│   │   ├── cloudinary.js # Cloudinary setup
│   │   ├── passport.js   # Passport authentication
│   │   └── prisma.js     # Prisma client
│   ├── controllers/      # Route controllers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middlewares/      # Express middlewares
│   ├── prisma/           # Prisma schema and migrations
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   ├── jobs/             # Cron jobs
│   ├── uploads/          # Temporary upload directory
│   ├── package.json
│   └── .env             # Backend environment variables
│
└── README.md            # This file
```

---

## Troubleshooting

### Frontend Issues

1. **Port 3000 already in use**
   - Change the port by setting `PORT=3001` in your `.env` file or kill the process using port 3000

2. **reCAPTCHA not showing**
   - Verify `REACT_APP_RECAPTCHA_KEY` is set correctly in `client/.env`
   - Check browser console for errors
   - Ensure your domain is registered in reCAPTCHA admin console

3. **API connection errors**
   - Verify `REACT_APP_API_URL` matches your backend server URL
   - Ensure backend server is running
   - Check CORS configuration in backend

4. **TinyMCE editor not loading**
   - Verify `REACT_APP_TINYMCE_API_KEY` is set correctly in `client/.env`
   - Check browser console for TinyMCE-related errors
   - Ensure you've restarted the development server after adding the API key
   - Verify your TinyMCE API key is valid and not expired
   - Check that your domain is allowed in TinyMCE account settings (for production)

### Backend Issues

1. **Database connection errors**
   - Verify `DATABASE_URL` is correct in `server/.env`
   - Ensure PostgreSQL is running
   - Check database credentials

2. **reCAPTCHA verification fails**
   - Verify `RECAPTCHA_SECRET_KEY` is correct
   - Check that the secret key matches the site key used in frontend
   - Ensure reCAPTCHA keys are from the same reCAPTCHA site

3. **Cloudinary upload errors**
   - Verify all three Cloudinary credentials are correct
   - Check your Cloudinary account is active
   - Verify API key and secret are not expired

4. **Prisma errors**
   - Run `npx prisma generate` after schema changes
   - Run `npx prisma migrate dev` to apply migrations
   - Check `DATABASE_URL` format is correct

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [TinyMCE React Integration](https://www.tiny.cloud/docs/tinymce/latest/react-ref/)

---

## License

Distributed under the MIT License. See the `LICENSE` file for more information.
