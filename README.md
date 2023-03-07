# Charging Station management system

## Getting Started

### Prerequisites

Before you can run the project, you will need to have the following software installed on your system:

1. Docker
2. Docker Compose

### Installing and running the project

```
git clone https://github.com/tasmiarahmantanjin/charging_station_system
cd charging_station_system
docker-compose up
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
