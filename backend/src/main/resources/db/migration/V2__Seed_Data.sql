-- V2__Seed_Data.sql
-- Seed categories
INSERT INTO category (name, description) VALUES
('Fiction',          'Novels, short stories, and imaginative narratives'),
('Non-Fiction',      'Factual works including biographies and essays'),
('Science & Tech',   'Computer science, engineering, and natural sciences'),
('History',          'World history, civilisations, and historical accounts'),
('Self-Improvement', 'Personal growth, productivity, and wellness'),
('Children',         'Picture books, middle-grade, and young-adult fiction');

-- Fiction
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'The Great Gatsby',  'F. Scott Fitzgerald', '9780743273565',
       'A portrait of the Jazz Age in all of its decadence and excess.',
       9.99, 42, 'Scribner', 1925, 180, 'English', id FROM category WHERE name='Fiction';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT '1984', 'George Orwell', '9780451524935',
       'A dystopian novel set in a totalitarian future society.',
       8.49, 60, 'Secker & Warburg', 1949, 328, 'English', id FROM category WHERE name='Fiction';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'To Kill a Mockingbird', 'Harper Lee', '9780061935466',
       'A story of racial injustice and childhood innocence in the American South.',
       10.99, 35, 'J.B. Lippincott & Co.', 1960, 281, 'English', id FROM category WHERE name='Fiction';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'The Hitchhiker''s Guide to the Galaxy', 'Douglas Adams', '9780345391803',
       'A comedic science fiction series following Arthur Dent across the universe.',
       11.99, 50, 'Pan Books', 1979, 193, 'English', id FROM category WHERE name='Fiction';

-- Non-Fiction
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097',
       'How Homo sapiens came to dominate and shape the world.',
       14.99, 28, 'Harvill Secker', 2011, 443, 'English', id FROM category WHERE name='Non-Fiction';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Educated', 'Tara Westover', '9780399590504',
       'A memoir about a young girl who escapes a survivalist family to pursue education.',
       13.49, 20, 'Random House', 2018, 334, 'English', id FROM category WHERE name='Non-Fiction';

-- Science & Tech
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Clean Code', 'Robert C. Martin', '9780132350884',
       'A handbook of agile software craftsmanship for professional developers.',
       35.99, 15, 'Prentice Hall', 2008, 464, 'English', id FROM category WHERE name='Science & Tech';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'The Pragmatic Programmer', 'David Thomas & Andrew Hunt', '9780135957059',
       'Your journey to mastery — a must-read for any serious software developer.',
       38.99, 12, 'Addison-Wesley', 1999, 352, 'English', id FROM category WHERE name='Science & Tech';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Designing Data-Intensive Applications', 'Martin Kleppmann', '9781449373320',
       'The big ideas behind reliable, scalable, and maintainable systems.',
       42.99, 8, 'O''Reilly Media', 2017, 616, 'English', id FROM category WHERE name='Science & Tech';

-- History
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Guns, Germs, and Steel', 'Jared Diamond', '9780393354324',
       'The fates of human societies and how geography shapes civilisation.',
       12.99, 22, 'W. W. Norton', 1997, 480, 'English', id FROM category WHERE name='History';

-- Self-Improvement
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Atomic Habits', 'James Clear', '9780735211292',
       'An easy and proven way to build good habits and break bad ones.',
       16.99, 55, 'Avery', 2018, 320, 'English', id FROM category WHERE name='Self-Improvement';

INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Deep Work', 'Cal Newport', '9781455586691',
       'Rules for focused success in a distracted world.',
       15.49, 30, 'Grand Central Publishing', 2016, 296, 'English', id FROM category WHERE name='Self-Improvement';

-- Children
INSERT INTO book (title, author, isbn, description, price, stock, publisher, published_year, pages, language, category_id)
SELECT 'Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', '9780747532699',
       'A young boy discovers he is a wizard and attends Hogwarts School of Witchcraft.',
       12.99, 70, 'Bloomsbury', 1997, 223, 'English', id FROM category WHERE name='Children';
