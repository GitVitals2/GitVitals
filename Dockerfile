# Dockerfile - Local Development
# Single-stage development image with hot reload

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
