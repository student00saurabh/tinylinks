# 🔗 TinyLink — Advanced URL Shortener Web App

TinyLink is a complete full-stack URL shortening platform where users can create short links, track total clicks, view analytics, edit or delete links, and manage their dashboard securely after login.

🌐 Live Production URL
https://tinylinks-twcr.onrender.com

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| 🔐 User Authentication | Login / Register using Passport.js |
| ✂️ URL Shortening | Convert long URLs into short shareable links |
| 🧾 Link Dashboard | View all links, search, copy, stats, edit & delete |
| 📊 Analytics | Track visits & last clicked time |
| 🪄 Custom Short IDs | Users can create their own short link codes |
| 📌 Health Check API | Verify server status for uptime monitoring |
| 🖥️ Beautiful UI | TailwindCSS + EJS with modals & smooth UX feedback |

---

## 🏗️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **Node.js + Express.js** | Backend server and routing |
| **MongoDB + Mongoose** | Database and models |
| **Passport.js** | User authentication |
| **EJS & EJS-Mate** | Dynamic views and templating |
| **TailwindCSS** | Styling and responsive UI |
| **Method-Override** | Support PUT/DELETE from forms |
| **ShortID / NanoID** | Short URL generation |
| **dotenv** | Environment configuration |

---

## 📁 Project Folder Structure

tiniylink/
│── app.js
│── package.json
│── .env
│── README.md
│
├── controllers/
│ ├── user.js
| ├── home.js
│ ├── linkController.js
│ └── healthController.js
│
├── models/
│ ├── User.js
│ └── Link.js
│
├── routes/
│ ├── user.js
│ ├── linkRoutes.js
│ ├── healthRoutes.js
│ └── home.js
│
├── middleware.js
│
├── views/
│ ├── layouts/
│ │ └── boilerplate.ejs
│ ├── TinyLink/
│ │ ├── home.ejs
│ │ ├── dashboard.ejs
│ │ ├── healthz.ejs
│ │ └── stats.ejs
│ └── users/
| ├── profile.ejs
│ ├── login.ejs
│ └── register.ejs
│
└── public/
├── css/
├── js/
└── images/


---

## 📥 Installation Guide (Run Project Locally)

### 1️⃣ Clone the repository
```sh
git clone https://github.com/your-username/tinylink.git
cd tinylink

npm install

PORT=3000
MONGO_URI=mongodb://localhost:27017/tinylink
SESSION_SECRET=your_secret_key
BASE_URL=http://localhost:3000
node app.js
