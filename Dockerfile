FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Set proper permissions for Next.js directories
RUN mkdir -p .next/cache && chmod -R 777 .next

# Expose port
EXPOSE 3000

# Command will be provided by docker-compose
CMD ["npm", "run", "dev"]