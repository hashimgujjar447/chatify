# 💬 WhatsApp Clone - Real-time Chat Application

A full-stack real-time chat application built with Next.js, Socket.IO, PostgreSQL, and Prisma. Features include private messaging, group chats, image sharing, and real-time presence tracking.

## 🚀 Features

### Authentication & User Management

- ✅ User registration with email OTP verification
- ✅ Secure login/logout with JWT tokens (httpOnly cookies)
- ✅ Password reset functionality
- ✅ User profile management with avatar upload

### Private Messaging

- ✅ Real-time 1-on-1 messaging
- ✅ Image sharing with Cloudinary integration
- ✅ Online/offline status tracking
- ✅ Message history and persistence
- ✅ Typing indicators
- ✅ Message timestamps

### Group Chat

- ✅ Create and manage group chats
- ✅ Add/remove group members
- ✅ Real-time group messaging
- ✅ Group image sharing
- ✅ Admin role management
- ✅ Group descriptions and avatars

### Real-time Features

- ✅ Socket.IO integration for instant messaging
- ✅ Online/offline user presence
- ✅ Real-time message delivery
- ✅ Room-based chat (private & group)
- ✅ User join/leave notifications

### User Connections

- ✅ Send/receive connection requests
- ✅ Accept/reject friend requests
- ✅ Connection status management (PENDING/ACCEPTED/REJECTED)

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS 4** - Styling
- **Redux Toolkit** - State management
- **Lucide React** - Icon library
- **Socket.IO Client** - Real-time communication

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Custom Node.js Server** - Socket.IO integration
- **Socket.IO** - WebSocket communication
- **PostgreSQL** - Database
- **Prisma ORM** - Database toolkit
- **JWT (jose)** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image/file storage
- **Nodemailer** - Email service

## 📦 Installation

### Prerequisites

- Node.js 20+
- PostgreSQL database
- pnpm (recommended) or npm

### Setup Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd whatsapp
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Nodemailer)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

4. **Setup database**

```bash
# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev
```

5. **Run the development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
whatsapp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # Private chat endpoints
│   │   ├── group/                # Group chat endpoints
│   │   ├── user/                 # User management endpoints
│   │   └── upload/               # File upload endpoint
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── profile/                  # Profile page
│   ├── group/                    # Group management pages
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ChatBox.tsx               # Chat interface
│   ├── SideBar.tsx               # Contacts sidebar
│   ├── Header.tsx                # App header
│   ├── SocketProvider.tsx        # Socket.IO provider
│   └── ReduxProvider.tsx         # Redux provider
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── cloudinary.ts             # Cloudinary config
│   ├── verifyAuth.ts             # JWT verification
│   └── sendMail.ts               # Email service
├── prisma/                       # Database schema
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Database migrations
├── store/                        # Redux store
│   ├── store.ts                  # Store configuration
│   └── features/                 # Redux slices
│       ├── auth/userSlice.ts     # User state
│       └── socket/socketSlice.ts # Socket state
├── server.ts                     # Custom Node.js + Socket.IO server
└── package.json                  # Dependencies
```

## 🗄️ Database Schema

### Models

- **User** - User accounts with authentication
- **UserConnections** - Friend connections (PENDING/ACCEPTED/REJECTED)
- **Chat** - Private messages with attachments
- **Group** - Group chat rooms
- **GroupMember** - User membership in groups
- **GroupChat** - Group messages with attachments

## 🔐 Authentication Flow

1. User registers with email → OTP sent
2. User verifies OTP → Account activated
3. User logs in → JWT token stored in httpOnly cookie
4. Token automatically included in API requests
5. Socket.IO uses userId from auth middleware

## 📡 Socket.IO Events

### Client → Server

- `join-room` - Join private chat room
- `join-group-room` - Join group chat room
- `send-message` - Send private message
- `send-group-message` - Send group message

### Server → Client

- `new-message` - Receive private message
- `new-group-message` - Receive group message
- `user-online` - User came online
- `user-offline` - User went offline
- `user-join` - User joined room
- `user-join-group` - User joined group

## 🖼️ Image Upload

Images are uploaded to Cloudinary:

- Maximum size: 5MB (images)
- Supported formats: JPG, PNG, GIF, WebP
- Stored in `CUploads` folder
- Returns secure HTTPS URL

## 🚀 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Socket.IO
pnpm dev:next         # Start Next.js only (no sockets)

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm prisma generate  # Generate Prisma Client
pnpm prisma migrate dev  # Run migrations
pnpm prisma studio    # Open Prisma Studio

# Linting
pnpm lint             # Run ESLint
```

## 🎨 UI Features

- Modern, clean interface with gradient design
- Responsive layout (mobile & desktop)
- Smooth animations and transitions
- Image previews before sending
- Message timestamps
- Online status indicators
- Typing indicators
- Smooth scrolling chat history

## 🔒 Security Features

- JWT tokens with httpOnly cookies
- Password hashing with bcrypt
- OTP verification for registration
- Protected API routes
- SQL injection prevention (Prisma)
- XSS protection
- CORS configuration

## 📝 Environment Variables

| Variable                | Description                          | Required |
| ----------------------- | ------------------------------------ | -------- |
| `DATABASE_URL`          | PostgreSQL connection string         | ✅       |
| `JWT_SECRET`            | Secret for JWT signing               | ✅       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                | ✅       |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                   | ✅       |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                | ✅       |
| `EMAIL_USER`            | Email for sending OTPs               | ✅       |
| `EMAIL_PASSWORD`        | Email app password                   | ✅       |
| `NEXT_PUBLIC_APP_URL`   | Application URL                      | ✅       |
| `NODE_ENV`              | Environment (development/production) | ✅       |

## 🐛 Troubleshooting

### Prisma Issues

```bash
# Clear Prisma cache
pnpm prisma generate --force

# Reset database
pnpm prisma migrate reset
```

### Socket Connection Issues

- Check if port 3000 is available
- Verify Socket.IO client version matches server
- Check CORS configuration in server.ts

### Image Upload Issues

- Verify Cloudinary credentials
- Check file size (max 5MB)
- Ensure proper file format

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 👨‍💻 Author

Built with ❤️ using Next.js and Socket.IO

---

**Happy Coding! 🚀**
