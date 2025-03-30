# Use an official Node.js runtime as the base image
FROM node:20.12.0-alpine3.19

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --include=dev

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on (change if needed)
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "dev"]
