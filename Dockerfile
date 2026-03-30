# Use an official Node.js runtime as a base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install --silent

# Copy the application code into the container
COPY . ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]