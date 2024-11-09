# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE ${PORT}

# Start the application
CMD ["npm", "run", "start:prod"]