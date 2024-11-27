#!/bin/bash

# Retrieve the IP address using ipconfig and findstr
IP_ADDRESS=$(ipconfig | grep -A 10 "Wireless LAN adapter" | grep "IPv4 Address" | awk '{print $NF}')

if [ -z "$IP_ADDRESS" ]; then
  echo "Failed to retrieve IP address. Exiting."
  exit 1
fi

echo "Current IP address: $IP_ADDRESS"

# Path to the .env file in the quiz folder
ENV_FILE="quiz/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo ".env file not found in quiz folder! Exiting."
  exit 1
fi

# Define the new API URL
NEW_API_URL="REACT_APP_API_URL=http://$IP_ADDRESS:8080/questions"

# Update the .env file
echo "Updating .env file with: $NEW_API_URL"

# Check if REACT_APP_API_URL exists in the file
if grep -q '^REACT_APP_API_URL=' "$ENV_FILE"; then
  # Replace the existing line
  sed -i "s|^REACT_APP_API_URL=.*|$NEW_API_URL|" "$ENV_FILE"
else
  # Append the new line
  echo "$NEW_API_URL" >> "$ENV_FILE"
fi

echo ".env file updated successfully."


# Navigate to the quiz folder
echo "Navigating to quiz folder..."
cd quiz || { echo "Quiz folder not found! Exiting."; exit 1; }

# Install dependencies and build
echo "Installing dependencies in quiz folder..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed in quiz folder! Exiting."
  exit 1
fi

echo "Running build in quiz folder..."
npm run build
if [ $? -ne 0 ]; then
  echo "npm run build failed in quiz folder! Exiting."
  exit 1
fi

# Navigate back to root and then to quiz_admin folder
echo "Navigating back to root folder..."
cd ..

echo "Navigating to quiz_admin folder..."
cd quiz_admin || { echo "Quiz_admin folder not found! Exiting."; exit 1; }

# Install dependencies and build
echo "Installing dependencies in quiz_admin folder..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed in quiz_admin folder! Exiting."
  exit 1
fi

echo "Running build in quiz_admin folder..."
npm run build
if [ $? -ne 0 ]; then
  echo "npm run build failed in quiz_admin folder! Exiting."
  exit 1
fi

# Navigate back to the root folder
echo "Navigating back to root folder..."
cd ..

# Install dependencies at the root and start the Node.js server
echo "Installing dependencies in root folder..."
npm install
if [ $? -ne 0 ]; then
  echo "npm install failed in root folder! Exiting."
  exit 1
fi

echo "Starting the Node.js server..."
node server.js
if [ $? -ne 0 ]; then
  echo "Failed to start the server! Exiting."
  exit 1
fi

echo "All tasks completed successfully."
