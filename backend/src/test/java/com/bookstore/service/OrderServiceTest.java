package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService — unit tests")
class OrderServiceTest {

    @Mock OrderRepository orderRepository;
    @Mock CartRepository  cartRepository;
    @Mock BookRepository  bookRepository;
    @InjectMocks OrderService orderService;

    private Book  book;
    private Cart  cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        Category fiction = Category.builder().id(1L).name("Fiction").build();
        book     = Book.builder().id(1L).title("Sapiens").author("Harari")
                       .price(new BigDecimal("14.99")).stock(30).isActive(true).category(fiction).build();
        cart     = Cart.builder().id(1L).sessionId("s1").items(new ArrayList<>()).build();
        cartItem = CartItem.builder().id(1L).cart(cart).book(book).quantity(2).build();
        cart.getItems().add(cartItem);
    }

    @Test @DisplayName("placeOrder creates order and clears cart")
    void placeOrder_success() {
        when(cartRepository.findBySessionId("s1")).thenReturn(Optional.of(cart));
        when(orderRepository.save(any())).thenAnswer(inv -> { Order o=inv.getArgument(0); o.setId(1L); return o; });
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(bookRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = PlaceOrderRequest.builder()
            .customerName("Alice").customerEmail("alice@test.com").sessionId("s1").build();
        var res = orderService.placeOrder(req);

        assertThat(res.getCustomerName()).isEqualTo("Alice");
        assertThat(res.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(res.getOrderNumber()).startsWith("ORD-");
        assertThat(res.getTotalAmount()).isEqualByComparingTo("29.98");
        assertThat(res.getItems()).hasSize(1);
        verify(bookRepository).save(argThat(b -> b.getStock() == 28)); // decreased
    }

    @Test @DisplayName("placeOrder throws when cart not found")
    void placeOrder_noCart() {
        when(cartRepository.findBySessionId("missing")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> orderService.placeOrder(
            PlaceOrderRequest.builder().customerName("X").customerEmail("x@x.com").sessionId("missing").build()))
            .isInstanceOf(BusinessException.class).hasMessageContaining("Cart not found");
    }

    @Test @DisplayName("placeOrder throws when cart is empty")
    void placeOrder_emptyCart() {
        cart.getItems().clear();
        when(cartRepository.findBySessionId("s1")).thenReturn(Optional.of(cart));
        assertThatThrownBy(() -> orderService.placeOrder(
            PlaceOrderRequest.builder().customerName("X").customerEmail("x@x.com").sessionId("s1").build()))
            .isInstanceOf(BusinessException.class).hasMessageContaining("empty cart");
    }

    @Test @DisplayName("placeOrder throws when insufficient stock")
    void placeOrder_insufficientStock() {
        book.setStock(1); // cartItem wants 2
        when(cartRepository.findBySessionId("s1")).thenReturn(Optional.of(cart));
        assertThatThrownBy(() -> orderService.placeOrder(
            PlaceOrderRequest.builder().customerName("X").customerEmail("x@x.com").sessionId("s1").build()))
            .isInstanceOf(BusinessException.class).hasMessageContaining("Insufficient stock");
    }

    @Test @DisplayName("updateStatus transitions PENDING → CONFIRMED")
    void updateStatus_success() {
        Order order = Order.builder().id(1L).orderNumber("ORD-X").status(OrderStatus.PENDING)
                          .items(new ArrayList<>()).totalAmount(BigDecimal.ZERO).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var res = orderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.CONFIRMED));
        assertThat(res.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
    }

    @Test @DisplayName("updateStatus throws when order is CANCELLED")
    void updateStatus_cancelledFinal() {
        Order order = Order.builder().id(1L).status(OrderStatus.CANCELLED)
                          .items(new ArrayList<>()).totalAmount(BigDecimal.ZERO).build();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        assertThatThrownBy(() -> orderService.updateStatus(1L, new OrderStatusUpdateRequest(OrderStatus.CONFIRMED)))
            .isInstanceOf(BusinessException.class).hasMessageContaining("Cannot change status");
    }

    @Test @DisplayName("findById throws when not found")
    void findById_notFound() {
        when(orderRepository.findByIdWithItems(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> orderService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test @DisplayName("findAll returns paged results")
    void findAll_paged() {
        Order o = Order.builder().id(1L).orderNumber("ORD-001").status(OrderStatus.PENDING)
                       .totalAmount(BigDecimal.ZERO).items(new ArrayList<>()).build();
        when(orderRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(o)));
        var page = orderService.findAll(PageRequest.of(0, 10));
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getOrderNumber()).isEqualTo("ORD-001");
    }

    @Test @DisplayName("findByEmail returns customer orders")
    void findByEmail() {
        Order o = Order.builder().id(1L).orderNumber("ORD-001").status(OrderStatus.DELIVERED)
                       .totalAmount(BigDecimal.TEN).items(new ArrayList<>()).build();
        when(orderRepository.findAllByCustomerEmailOrderByCreatedAtDesc("a@b.com"))
            .thenReturn(List.of(o));
        var res = orderService.findByEmail("a@b.com");
        assertThat(res).hasSize(1);
    }
}
