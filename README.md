# Headless CMS

A modern, flexible headless CMS built with React, GraphQL, and MongoDB. This project provides a robust content management system with a clean and intuitive user interface.

![Dashboard Preview](https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=600&fit=crop&crop=edges)

## Features

- 🚀 **Modern Stack**: Built with React, GraphQL, and MongoDB
- 🔐 **Authentication & Authorization**: Role-based access control with admin, editor, and author roles
- 📝 **Content Types**: Create and manage custom content types with flexible fields
- 🗃️ **Content Management**: Create, edit, publish, and archive content entries
- 🖼️ **Media Library**: Upload and manage media assets
- 👥 **User Management**: Manage users and their permissions
- 🎨 **Beautiful UI**: Clean and intuitive interface built with Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**:
  - React
  - Apollo Client
  - React Router
  - React Hook Form
  - Tailwind CSS
  - Lucide Icons

- **Backend**:
  - Node.js
  - Express
  - Apollo Server
  - GraphQL
  - MongoDB
  - JSON Web Tokens

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/headless-cms.git
cd headless-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/headless-cms
JWT_SECRET=your_jwt_secret_key_change_in_production
```

4. Start the development server:
```bash
npm run dev
```

The application will start in development mode:
- Frontend: [http://localhost:3000](http://localhost:3000)
- GraphQL Server: [http://localhost:4000/graphql](http://localhost:4000/graphql)

### Default Users

The system creates two default users on first run:

1. Admin User:
   - Email: admin@example.com
   - Password: password123

2. Guest User:
   - Available through "Continue as Guest" option

## Project Structure

```
headless-cms/
├── server/                 # Backend server code
│   ├── models/            # MongoDB models
│   ├── utils/             # Utility functions
│   ├── schema.js          # GraphQL schema
│   └── resolvers.js       # GraphQL resolvers
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── context/          # React context providers
│   ├── pages/            # Page components
│   └── main.tsx          # Application entry point
└── package.json          # Project dependencies
```

## Content Type System

The CMS supports various field types for content:
- Text
- Rich Text
- Number
- Boolean
- Date
- Media
- Reference

Each content type can have multiple fields with different configurations:
- Required/Optional
- Multiple Values
- Custom Validations

## User Roles

1. **Admin**:
   - Full system access
   - Manage users and roles
   - Create/edit content types
   - Manage all content

2. **Editor**:
   - Publish/unpublish content
   - Create/edit all content
   - Access media library

3. **Author**:
   - Create and edit own content
   - Access media library

## API Access

The GraphQL API provides endpoints for:
- Content Type Management
- Content Operations
- User Authentication
- Media Management

Example GraphQL query:
```graphql
query GetContents {
  contents {
    id
    title
    slug
    status
    contentType {
      name
    }
    fields {
      fieldName
      value
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Apollo GraphQL](https://www.apollographql.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
