#!/bin/bash

# Set the base URL for the API
BASE_URL="http://localhost:8000"

# Create a temporary file to store the auth token
TOKEN_FILE=$(mktemp)

# Reset the database
echo "Resetting the database..."
docker exec -i node_server_container pnpx prisma db push --force-reset

# Seed the database
echo "Seeding the database..."
docker exec -i node_server_container pnpx prisma db seed

# Register a new user
echo "Registering a new user..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "Password123!", "first_name": "Test", "last_name": "User" }' \
  "$BASE_URL/auth/register"

# Wait for the database to update
sleep 2

# Get the verification token from the database
echo "Getting verification token..."
VERIFICATION_TOKEN=$(docker exec -i postgres_container psql -U postgres -d postgres -t -c "SELECT token FROM verification_tokens WHERE email = 'test@example.com' AND type = 'user_verification' AND status = 'unverified' ORDER BY created_at DESC LIMIT 1;" | tr -d '[:space:]')

# Verify the user
echo "Verifying the user..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "token": "'$VERIFICATION_TOKEN'" }' \
  "$BASE_URL/auth/verify-user-email"

# Log in with the new user and store the auth token
echo "Logging in..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "Password123!" }' \
  "$BASE_URL/auth/login" | jq -r '.access_token' > "$TOKEN_FILE"

# Get the auth token from the temporary file
TOKEN=$(cat "$TOKEN_FILE")

# Get the user's information
echo "Getting user information..."
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/auth/user"

# Create a new user
echo "Creating a new user..."
USER_ID=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "email": "test2@example.com", "password": "Password123!", "first_name": "Test2", "last_name": "User2" }' \
  "$BASE_URL/users" | jq -r '.id')

# Get all users
echo "Getting all users..."
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/users"

# Get a user by ID
echo "Getting a user by ID..."
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/users/$USER_ID"

# Update a user
echo "Updating a user..."
curl -X PATCH \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "first_name": "Updated" }' \
  "$BASE_URL/users/$USER_ID"

# Get the role ID
echo "Getting the role ID..."
ROLE_ID=$(curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/roles" | jq -r '.[0].id')

# Assign a role to a user
echo "Assigning a role to a user..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "user_id": "'$USER_ID'", "role_id": "'$ROLE_ID'" }' \
  "$BASE_URL/auth/assign-role"

# Revoke a role from a user
echo "Revoking a role from a user..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "user_id": "'$USER_ID'", "role_id": "'$ROLE_ID'" }' \
  "$BASE_URL/auth/revoke-role"

# Delete a user
echo "Deleting a user..."
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/users/$USER_ID"

# Clean up the temporary file
rm "$TOKEN_FILE"
