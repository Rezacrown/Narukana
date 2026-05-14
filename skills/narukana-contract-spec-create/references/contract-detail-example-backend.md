# Contract / API Details

> Example: REST API (UserAPI)

## Operation: getUsers
- Type: query
- Transport: http
- Method: GET
- Endpoint: /api/users

### Purpose
Retrieve a paginated list of all users.

### Input
- page: uint (query, optional, default: 1)
- limit: uint (query, optional, default: 20)
- role: string (query, optional, filter by role)

### Output
- users: User[]
- total: uint
- page: uint
- totalPages: uint

### Validation Rules
- page must be >= 1
- limit must be between 1 and 100

### Step-by-Step Logic
1. Parse query parameters
2. Validate pagination params
3. Query database with offset/limit
4. Return paginated results

### Edge Cases
- Empty result set: return empty array with total=0
- Invalid page number: return page 1 by default

### Status Codes
- 200: Success
- 400: Invalid query parameters
- 500: Server error

## Operation: createUser
- Type: mutation
- Transport: http
- Method: POST
- Endpoint: /api/users

### Purpose
Create a new user account.

### Input
- name: string (body, required)
- email: string (body, required)
- role: string (body, optional, default: "user")

### Output
- id: uint
- name: string
- email: string
- role: string
- createdAt: ISO timestamp

### Validation Rules
- name: 2-100 characters
- email: valid email format
- role: must be one of "user", "admin", "moderator"

### Step-by-Step Logic
1. Parse request body
2. Validate all fields
3. Check email uniqueness
4. Hash password if provided
5. Insert into database
6. Return created user

### Edge Cases
- Duplicate email: return 409 Conflict
- Invalid email format: return 400 with validation errors
- Missing required fields: return 400 with field list

### Status Codes
- 201: Created
- 400: Validation error
- 409: Duplicate email
- 500: Server error
