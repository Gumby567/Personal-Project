package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CartService — unit tests")
class CartServiceTest {

    @Mock CartRepository cartRepository;
    @Mock BookRepository  bookRepository;
    @InjectMocks CartService cartService;

    private static final String SID = "sess-abc";
    private Category fiction;
    private Book     book;
    private Cart     cart;

    @BeforeEach
    void setUp() {
        fiction = Category.builder().id(1L).name("Fiction").build();
        book    = Book.builder().id(1L).title("1984").author("Orwell")
                     .price(new BigDecimal("8.49")).stock(50).isActive(true).category(fiction).build();
        cart    = Cart.builder().id(1L).sessionId(SID).items(new ArrayList<>()).build();
    }

    @Test @DisplayName("getCart creates new cart when none exists")
    void getCart_createsNew() {
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.empty());
        when(cartRepository.save(any())).thenReturn(cart);
        var res = cartService.getCart(SID);
        assertThat(res.getItems()).isEmpty();
        verify(cartRepository).save(any(Cart.class));
    }

    @Test @DisplayName("getCart returns existing cart")
    void getCart_existing() {
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        var res = cartService.getCart(SID);
        assertThat(res.getSessionId()).isEqualTo(SID);
        verify(cartRepository, never()).save(any());
    }

    @Test @DisplayName("addItem adds book successfully")
    void addItem_success() {
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var res = cartService.addItem(SID, new CartItemRequest(1L, 3));
        assertThat(res.getItems()).hasSize(1);
        assertThat(res.getItems().get(0).getQuantity()).isEqualTo(3);
        assertThat(res.getTotalAmount()).isEqualByComparingTo("25.47");
    }

    @Test @DisplayName("addItem throws when book inactive")
    void addItem_inactiveBook() {
        book.setIsActive(false);
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        assertThatThrownBy(() -> cartService.addItem(SID, new CartItemRequest(1L, 1)))
            .isInstanceOf(BusinessException.class).hasMessageContaining("not available");
    }

    @Test @DisplayName("addItem throws when out of stock")
    void addItem_outOfStock() {
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        assertThatThrownBy(() -> cartService.addItem(SID, new CartItemRequest(1L, 999)))
            .isInstanceOf(BusinessException.class).hasMessageContaining("Insufficient stock");
    }

    @Test @DisplayName("addItem accumulates quantity for existing item")
    void addItem_accumulates() {
        CartItem existing = CartItem.builder().id(1L).cart(cart).book(book).quantity(5).build();
        cart.getItems().add(existing);
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var res = cartService.addItem(SID, new CartItemRequest(1L, 3));
        assertThat(res.getItems().get(0).getQuantity()).isEqualTo(8);
    }

    @Test @DisplayName("removeItem removes matching book")
    void removeItem_success() {
        CartItem item = CartItem.builder().id(1L).cart(cart).book(book).quantity(2).build();
        cart.getItems().add(item);
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var res = cartService.removeItem(SID, 1L);
        assertThat(res.getItems()).isEmpty();
    }

    @Test @DisplayName("updateItem sets zero quantity → removes item")
    void updateItem_zeroRemoves() {
        CartItem item = CartItem.builder().id(1L).cart(cart).book(book).quantity(4).build();
        cart.getItems().add(item);
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var res = cartService.updateItem(SID, 1L, 0);
        assertThat(res.getItems()).isEmpty();
    }

    @Test @DisplayName("clearCart empties all items")
    void clearCart_success() {
        cart.getItems().add(CartItem.builder().id(1L).cart(cart).book(book).quantity(2).build());
        when(cartRepository.findBySessionId(SID)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        cartService.clearCart(SID);
        verify(cartRepository).save(argThat(c -> c.getItems().isEmpty()));
    }
}
