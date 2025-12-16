Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install dependencies
npm install @prisma/client prisma @types/react @types/node @types/react-dom sonner next

# Initialize Prisma
npx prisma init
npx prisma generate
