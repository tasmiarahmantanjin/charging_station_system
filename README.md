# Charging Station management system

## Getting Started

### Prerequisites

Before you can run the project, you will need to have the following software installed on your system:

1. Docker
2. Docker Compose

### Installing and running the project with docker

```
git clone https://github.com/tasmiarahmantanjin/charging_station_system
cd charging_station_system
cd server
touch .env
npm install
docker-compose up
```

### Installing and running the project without docker

1. Use the DB_HOST as localhost in server/config file
2. Use the database and tables schemas from db/migrations file
3. Migrate them locally

### Example env file

```
APP_BACKEND_PORT=8000

DB_USERNAME=postgres
DB_PASSWORD=123456
DB_NAME=charging_station_system
# DB_HOST=localhost #if you want to run the app locally
DB_HOST=db # if you want to run app with docker
DB_PORT=5432
```

This will start the following services:

1. charging_station_system-db-1: A PostgreSQL database server
2. app-backend: A Node.js server running Express

The first time you run the stack, Docker will download the necessary images and set up the containers. This may take a few minutes.

Once the stack is running, you can access the app at http://localhost:8000. If everything is working correctly, you can start testing API endpoints.

### Running the tests

1. To run the automated tests, please change the server/config as follows:

```
  user: process.env.DB_USERNAME",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "charging_station_system",
  host: "localhost",
  port: 5433, // 5433 for testing
```

2. Then run the following commands sequentially:

```
open new terminal
cd charging_station_system
change the database config
```

### Built With

```
Node.js
Express
PostgreSQL
Docker
Docker Compose
```

Author

```
Tasmia Rahman
```
