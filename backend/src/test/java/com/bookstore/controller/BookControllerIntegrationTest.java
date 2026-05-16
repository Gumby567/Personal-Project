package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("BookController — integration tests")
class BookControllerIntegrationTest {

    @Autowired MockMvc          mockMvc;
    @Autowired ObjectMapper     mapper;
    @Autowired BookRepository   bookRepo;
    @Autowired CategoryRepository catRepo;

    private Category fiction;
    private Book     gatsby;

    @BeforeEach
    void setUp() {
        fiction = catRepo.save(Category.builder().name("Fiction-IT").description("Test").build());
        gatsby  = bookRepo.save(Book.builder()
            .title("The Great Gatsby").author("F. Scott Fitzgerald").isbn("978-0-IT")
            .price(new BigDecimal("9.99")).stock(42).isActive(true).category(fiction).build());
    }

    @Test @DisplayName("GET /api/books returns paged books")
    void getBooks_paged() throws Exception {
        mockMvc.perform(get("/books"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.content[*].title", hasItem("The Great Gatsby")));
    }

    @Test @DisplayName("GET /api/books?search=gatsby filters correctly")
    void getBooks_search() throws Exception {
        mockMvc.perform(get("/books").param("search","gatsby"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content[0].title", containsStringIgnoringCase("gatsby")));
    }

    @Test @DisplayName("GET /api/books/{id} returns correct book")
    void getBook_byId() throws Exception {
        mockMvc.perform(get("/books/" + gatsby.getId()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.title").value("The Great Gatsby"))
            .andExpect(jsonPath("$.data.categoryName").value("Fiction-IT"));
    }

    @Test @DisplayName("GET /api/books/{id} returns 404 for unknown id")
    void getBook_notFound() throws Exception {
        mockMvc.perform(get("/books/99999")).andExpect(status().isNotFound());
    }

    @Test @DisplayName("POST /api/books creates a book")
    void createBook() throws Exception {
        var req = BookRequest.builder()
            .title("1984").author("George Orwell").price(new BigDecimal("8.49"))
            .stock(60).categoryId(fiction.getId()).build();

        mockMvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.title").value("1984"))
            .andExpect(jsonPath("$.data.categoryName").value("Fiction-IT"));
    }

    @Test @DisplayName("POST /api/books with blank title returns 400")
    void createBook_validation() throws Exception {
        var req = BookRequest.builder().title("").author("X")
            .price(BigDecimal.ONE).stock(1).categoryId(fiction.getId()).build();
        mockMvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("PUT /api/books/{id} updates price and stock")
    void updateBook() throws Exception {
        var req = BookUpdateRequest.builder()
            .price(new BigDecimal("11.99")).stock(55).build();
        mockMvc.perform(put("/books/" + gatsby.getId()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.price").value(11.99))
            .andExpect(jsonPath("$.data.stock").value(55))
            .andExpect(jsonPath("$.data.title").value("The Great Gatsby"));
    }

    @Test @DisplayName("DELETE /api/books/{id} removes book")
    void deleteBook() throws Exception {
        mockMvc.perform(delete("/books/" + gatsby.getId()))
            .andExpect(status().isOk());
        mockMvc.perform(get("/books/" + gatsby.getId()))
            .andExpect(status().isNotFound());
    }

    @Test @DisplayName("GET /api/books/categories returns all categories")
    void getCategories() throws Exception {
        mockMvc.perform(get("/books/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].name", hasItem("Fiction-IT")));
    }
}
