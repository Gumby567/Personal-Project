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
@DisplayName("OrderController — integration tests")
class OrderControllerIntegrationTest {

    @Autowired MockMvc          mockMvc;
    @Autowired ObjectMapper     mapper;
    @Autowired OrderRepository  orderRepo;
    @Autowired CartRepository   cartRepo;
    @Autowired BookRepository   bookRepo;
    @Autowired CategoryRepository catRepo;

    private Book book;
    private Cart cart;

    @BeforeEach
    void setUp() {
        var cat = catRepo.save(Category.builder().name("Sci-IT").description("test").build());
        book    = bookRepo.save(Book.builder().title("Clean Code").author("Martin")
            .price(new BigDecimal("35.99")).stock(15).isActive(true).category(cat).build());
        cart    = cartRepo.save(Cart.builder().sessionId("order-it-sess").build());
        cart.getItems().add(CartItem.builder().cart(cart).book(book).quantity(2).build());
        cartRepo.save(cart);
    }

    @Test @DisplayName("POST /api/orders places an order from cart")
    void placeOrder_success() throws Exception {
        var req = PlaceOrderRequest.builder()
            .customerName("Bob Builder").customerEmail("bob@example.com")
            .sessionId("order-it-sess").build();

        mockMvc.perform(post("/orders").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.orderNumber", startsWith("ORD-")))
            .andExpect(jsonPath("$.data.customerName").value("Bob Builder"))
            .andExpect(jsonPath("$.data.status").value("PENDING"))
            .andExpect(jsonPath("$.data.totalAmount").value(71.98))
            .andExpect(jsonPath("$.data.items", hasSize(1)));
    }

    @Test @DisplayName("POST /api/orders with invalid email returns 400")
    void placeOrder_badEmail() throws Exception {
        var req = PlaceOrderRequest.builder()
            .customerName("Bad").customerEmail("not-email").sessionId("order-it-sess").build();
        mockMvc.perform(post("/orders").contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest());
    }

    @Test @DisplayName("GET /api/orders returns paged list")
    void getAll() throws Exception {
        orderRepo.save(Order.builder().orderNumber("ORD-IT-001").customerName("Test")
            .customerEmail("t@t.com").status(OrderStatus.PENDING)
            .totalAmount(BigDecimal.TEN).build());

        mockMvc.perform(get("/orders"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test @DisplayName("GET /api/orders/{id} returns 404 when missing")
    void getById_notFound() throws Exception {
        mockMvc.perform(get("/orders/88888")).andExpect(status().isNotFound());
    }

    @Test @DisplayName("PATCH /api/orders/{id}/status updates status")
    void updateStatus() throws Exception {
        var order = orderRepo.save(Order.builder().orderNumber("ORD-IT-STATUS")
            .customerName("T").customerEmail("t@t.com")
            .status(OrderStatus.PENDING).totalAmount(BigDecimal.ZERO).build());

        mockMvc.perform(patch("/orders/" + order.getId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(new OrderStatusUpdateRequest(OrderStatus.CONFIRMED))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }

    @Test @DisplayName("GET /api/orders/my returns customer order history")
    void myOrders() throws Exception {
        orderRepo.save(Order.builder().orderNumber("ORD-MY-001").customerName("Alice")
            .customerEmail("alice@shop.com").status(OrderStatus.DELIVERED)
            .totalAmount(new BigDecimal("35.99")).build());

        mockMvc.perform(get("/orders/my").param("email","alice@shop.com"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].customerEmail").value("alice@shop.com"));
    }
}
