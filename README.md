# 🔍 ZUT Lost & Found System
**Zambia University of Technology — Full-Stack Final Project**

A fully functional Lost and Found web application built with **React.js**, **Express.js**, and **PostgreSQL**.

---

## ✅ Features Covered (All Assignment Requirements)

| Requirement | Implementation |
|---|---|
| User Authentication & Login | JWT-based auth, bcrypt password hashing |
| CRUD Operations | Create/Read/Update/Delete items & claims |
| PostgreSQL Integration | Full relational schema with 3 tables |
| Express.js API | RESTful API with 15+ endpoints |
| File Upload | Multer middleware, image upload for items |
| Responsive React Frontend | Mobile-friendly UI with React Router |

---

## 🏗️ Project Structure

```
lost-and-found/
├── database.sql              ← Run this first to set up PostgreSQL
├── backend/
│   ├── server.js             ← Express entry point
│   ├── db.js                 ← PostgreSQL connection pool
│   ├── .env.example          ← Copy to .env and fill in values
│   ├── middleware/
│   │   ├── auth.js           ← JWT authentication middleware
│   │   └── upload.js         ← Multer file upload middleware
│   ├── routes/
│   │   ├── auth.js           ← POST /register, /login, GET /me
│   │   ├── items.js          ← Full CRUD for items + image upload
│   │   ├── claims.js         ← Submit, approve, reject claims
│   │   └── users.js          ← Profile update, admin stats, role change
│   └── uploads/              ← Uploaded images stored here (auto-created)
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js            ← Route definitions
        ├── styles.css        ← All global styles
        ├── context/
        │   └── AuthContext.js ← Global auth state
        ├── components/
        │   ├── Navbar.js
        │   └── ItemCard.js
        └── pages/
            ├── Home.js        ← Landing page with stats
            ├── Items.js       ← Browse + filter + paginate
            ├── ItemDetail.js  ← View + claim + delete
            ├── ReportItem.js  ← Report lost/found with image
            ├── EditItem.js    ← Edit own items
            ├── Login.js       ← Login + Register forms
            ├── Register.js
            ├── MyClaims.js    ← Track submitted claims
            ├── Profile.js     ← Update profile + password
            └── Dashboard.js   ← Admin panel (stats, manage all)
```

---

## ⚙️ Setup Instructions

### Step 1 — Prerequisites
Make sure you have installed:
- **Node.js** (v18 or newer): https://nodejs.org
- **PostgreSQL** (v14 or newer): https://postgresql.org
- **npm** (comes with Node.js)

### Step 2 — Set Up the Database

Open **pgAdmin** or **psql** and run:
```sql
CREATE DATABASE lost_and_found;
```

Then connect to the new database and run the schema:
```bash
psql -U postgres -d lost_and_found -f database.sql
```
Or paste the contents of `database.sql` directly into pgAdmin's Query Tool.

### Step 3 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your PostgreSQL password:
```
DB_PASSWORD=your_actual_postgres_password
```

### Step 4 — Install & Run the Backend

```bash
cd backend
npm install
npm start
```

The API will run at **http://localhost:5000**

### Step 5 — Install & Run the Frontend

Open a **new terminal**:
```bash
cd frontend
npm install
npm start
```

The app will open at **http://localhost:3000**

---

## 🔑 Default Admin Account

After running `database.sql`, an admin account is seeded:

| Field | Value |
|---|---|
| Email | `admin@zut.edu.zm` |
| Password | `admin123` |
| Role | `admin` |

> ⚠️ Change this password immediately after first login via the Profile page.

---

## 📡 API Endpoints

These endpoints are served by the **Express.js** app in `backend/server.js`.
The React frontend calls the same API through the proxy in `frontend/package.json`.

### Testing With Postman

Postman is used to test the backend API directly, without clicking through the
React frontend.

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```
2. Open Postman and import `postman_collection.json`.
3. Run `Health Check` first. It should return a JSON response from
   `GET http://localhost:5000/api/health`.
4. Run `Auth > Login`. The collection automatically saves the returned JWT into
   the `token` variable.
5. Use the saved token to test protected requests such as creating an item,
   submitting a claim, viewing dashboard stats, or updating a profile.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (auth required) |

### Items
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/items` | List items (filters: status, category, search, page) |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create item with optional image upload (auth) |
| PUT | `/api/items/:id` | Update item (owner or admin) |
| DELETE | `/api/items/:id` | Delete item (owner or admin) |
| GET | `/api/items/user/mine` | Current user's items (auth) |

### Claims
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/claims` | Submit a claim (auth) |
| GET | `/api/claims/mine` | My submitted claims (auth) |
| GET | `/api/claims/item/:id` | All claims for an item (admin) |
| PUT | `/api/claims/:id` | Approve or reject claim (admin) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (admin) |
| GET | `/api/users/stats` | Dashboard statistics (admin) |
| PUT | `/api/users/profile` | Update own profile (auth) |
| PUT | `/api/users/:id/role` | Change user role (admin) |

---

## 🗄️ Database Schema

```
users        → id, full_name, email, password_hash, role, student_id, phone, created_at
items        → id, title, description, category, status, location, date_lost_found, image_url, reported_by (FK), claimed_by (FK), created_at, updated_at
claims       → id, item_id (FK), claimed_by (FK), description, status, created_at
```

---

## 🎓 Concepts Demonstrated

1. **Authentication** — JWT tokens, bcrypt hashing, protected routes
2. **CRUD** — Full Create/Read/Update/Delete on items and claims
3. **Database** — PostgreSQL with foreign keys, triggers, and complex queries
4. **API** — RESTful Express.js with middleware, error handling
5. **File Upload** — Multer for image uploads, served as static files
6. **Responsive UI** — React with React Router, filters, pagination, forms

---

*Submitted for Full-Stack Web Development — Zambia University of Technology, May 2026*
