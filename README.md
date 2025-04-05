# Kanban Board

A modern, full-stack Kanban board application built with Next.js, Prisma, and NextAuth.js. This project provides a sleek, drag-and-drop interface for managing tasks across customizable boards and columns.

## Features

- **User Authentication**: Secure login and registration with NextAuth.js
- **Multiple Boards**: Create and manage multiple project boards
- **Customizable Columns**: Add, edit, and reorder columns (e.g., TODO, DOING, DONE)
- **Drag and Drop**: Intuitive task management with react-beautiful-dnd
- **Task Details**: Create tasks with titles, descriptions, and subtasks
- **Progress Tracking**: Monitor subtask completion status
- **Dark/Light Mode**: Theme toggle for user preference
- **Persistent Storage**: PostgreSQL database with Prisma ORM

## Tech Stack

- **Frontend**:
  - Next.js 15 (App Router)
  - React 19
  - Tailwind CSS for styling
  - react-beautiful-dnd for drag and drop functionality
  - Lucide React for icons
- **Backend**:
  - Next.js API routes
  - Prisma ORM
  - PostgreSQL database
- **Authentication**:
  - NextAuth.js with credentials provider
  - Bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- PostgreSQL database
- npm or pnpm

### Installation

1. Clone the repository

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/kanban?schema=public"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
kanban-board/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   ├── boards/             # Board pages
│   └── ...
├── components/             # React components
│   ├── board.js            # Board component
│   ├── column.js           # Column component
│   ├── task-card.js        # Task card component
│   └── ...
├── context/                # React context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and configurations
│   ├── auth.js             # NextAuth configuration
│   └── prisma.js           # Prisma client
├── prisma/                 # Prisma schema and migrations
└── public/                 # Static assets
```

## Usage

1. **Sign up or log in** to access your boards
2. **Create a new board** by clicking "Create New Board" in the sidebar
3. **Add columns** to your board (e.g., TODO, DOING, DONE)
4. **Create tasks** by clicking "Add New Task"
5. **Drag and drop tasks** between columns to update their status
6. **Click on a task** to view details, edit, or manage subtasks
7. **Toggle the theme** using the theme switch in the sidebar
8. **Logout** to end your session

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd)
- [Tailwind CSS](https://tailwindcss.com/)
