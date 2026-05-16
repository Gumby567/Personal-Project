# Online Bookstore — Personal Project

> A full-stack web application built with **Java 21 (Spring Boot)** and **React**.

## User Stories

1. **Browse** — As a visitor, I can browse all available books so that I can find something I want to buy.
2. **Cart** — As a user, I can add a book to my shopping cart so that I can continue shopping before placing my order.
3. **Order** — As a user, I can confirm my cart and place an order so that the books are reserved for me.
4. **Admin** — As an admin, I can add, edit, and remove books from the catalogue so that the store always shows up-to-date products.
5. **History** — As a user, I can view my past orders so that I can keep track of what I have purchased.

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Backend   | Java 21, Spring Boot 3.2, Spring Data JPA, Flyway   |
| Database  | PostgreSQL 16 (Docker)                              |
| Frontend  | React 18, Vite, Tailwind CSS, TanStack Query        |
| i18n      | i18next — English 🇬🇧 & Estonian 🇪🇪               |
| Tests     | JUnit 5, Mockito, @SpringBootTest (H2)              |
| DevOps    | Docker Compose                                      |

---

## Quick Start

### Prerequisites
- Java 21, Maven 3.9+
- Node 20+, npm
- Docker Desktop

### 1 — Start the database
```bash
docker compose up postgres -d
```

### 2 — Run the backend
```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080/api
```

### 3 — Run the frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### 4 — Full stack (Docker)
```bash
docker compose up --build
# App at http://localhost  |  API at http://localhost:8080/api
```

---

## API Endpoints

| Method   | Path                                  | Description                    |
|----------|---------------------------------------|--------------------------------|
| GET      | /api/books                            | Browse books (filter, paginate)|
| GET      | /api/books/{id}                       | Get book detail                |
| GET      | /api/books/categories                 | List categories                |
| POST     | /api/books                            | Create book [Admin]            |
| PUT      | /api/books/{id}                       | Update book [Admin]            |
| DELETE   | /api/books/{id}                       | Delete book [Admin]            |
| GET      | /api/cart/{sessionId}                 | Get cart                       |
| POST     | /api/cart/{sessionId}/items           | Add to cart                    |
| PUT      | /api/cart/{sessionId}/items/{bookId}  | Update quantity                |
| DELETE   | /api/cart/{sessionId}/items/{bookId}  | Remove item                    |
| POST     | /api/orders                           | Place order                    |
| GET      | /api/orders                           | All orders [Admin]             |
| GET      | /api/orders/my?email=                 | My order history               |
| GET      | /api/orders/number/{num}              | Track order                    |
| PATCH    | /api/orders/{id}/status               | Update status [Admin]          |

---

## Running Tests
```bash
cd backend
mvn test                  # run all tests
mvn verify                # tests + JaCoCo coverage report
# open target/site/jacoco/index.html
```

---

## Project Structure

```
.
├── backend/
│   ├── src/main/java/com/bookstore/
│   │   ├── entity/          Book, Category, Order, OrderItem, Cart, CartItem
│   │   ├── dto/             Request/Response DTOs
│   │   ├── repository/      Spring Data JPA interfaces
│   │   ├── service/         BookService, CartService, OrderService
│   │   ├── controller/      BookController, CartController, OrderController
│   │   ├── exception/       GlobalExceptionHandler, custom exceptions
│   │   └── config/          WebConfig (CORS)
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/    V1__Initial_Schema.sql, V2__Seed_Data.sql
│   └── src/test/            BookServiceTest, CartServiceTest, OrderServiceTest
│                            BookControllerIntegrationTest, OrderControllerIntegrationTest
├── frontend/
│   ├── src/
│   │   ├── pages/           HomePage, BooksPage, BookDetail, CartPage, OrdersPage, AdminPage
│   │   ├── components/      BookCard, Navbar, Footer, UI primitives
│   │   ├── api/             Axios API client
│   │   ├── store/           Zustand (sessionId, cart count, admin mode)
│   │   └── i18n/            en.json, et.json
│   └── public/
│       └── ai-booking-2026.txt   ← project feature map for grading
└── docker-compose.yml
```
