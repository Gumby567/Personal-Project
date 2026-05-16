-- V1__Initial_Schema.sql
-- Online Bookstore — initial database schema

CREATE TABLE IF NOT EXISTS category (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    author      VARCHAR(255) NOT NULL,
    isbn        VARCHAR(20)  UNIQUE,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock       INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    cover_url   VARCHAR(512),
    publisher   VARCHAR(150),
    published_year INTEGER,
    pages       INTEGER,
    language    VARCHAR(50)  DEFAULT 'English',
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    category_id BIGINT       NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart (
    id         BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_item (
    id      BIGSERIAL PRIMARY KEY,
    cart_id BIGINT  NOT NULL REFERENCES cart(id)  ON DELETE CASCADE,
    book_id BIGINT  NOT NULL REFERENCES book(id)  ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, book_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id             BIGSERIAL PRIMARY KEY,
    order_number   VARCHAR(50)  NOT NULL UNIQUE,
    customer_name  VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(50),
    status         VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    total_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_order_status CHECK (
        status IN ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')
    )
);

CREATE TABLE IF NOT EXISTS order_item (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    book_id    BIGINT NOT NULL REFERENCES book(id)   ON DELETE RESTRICT,
    quantity   INTEGER       NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    subtotal   NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_book_category   ON book(category_id);
CREATE INDEX idx_book_active     ON book(is_active);
CREATE INDEX idx_book_author     ON book(author);
CREATE INDEX idx_cart_session    ON cart(session_id);
CREATE INDEX idx_order_status    ON orders(status);
CREATE INDEX idx_order_email     ON orders(customer_email);
CREATE INDEX idx_order_item_ord  ON order_item(order_id);
