package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final BookRepository  bookRepository;

    public CartResponse getCart(String sessionId) {
        Cart cart = cartRepository.findBySessionId(sessionId)
            .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));
        return toResponse(cart);
    }

    public CartResponse addItem(String sessionId, CartItemRequest req) {
        Cart cart = cartRepository.findBySessionId(sessionId)
            .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));

        Book book = bookRepository.findById(req.getBookId())
            .orElseThrow(() -> new ResourceNotFoundException("Book", req.getBookId()));

        if (!book.getIsActive())
            throw new BusinessException("\"" + book.getTitle() + "\" is not available.");
        if (!book.hasStock(req.getQuantity()))
            throw new BusinessException("Insufficient stock for \"" + book.getTitle() +
                "\". Available: " + book.getStock());

        cart.getItems().stream()
            .filter(i -> i.getBook().getId().equals(req.getBookId()))
            .findFirst()
            .ifPresentOrElse(existing -> {
                int newQty = existing.getQuantity() + req.getQuantity();
                if (!book.hasStock(newQty))
                    throw new BusinessException("Insufficient stock. Available: " + book.getStock() +
                        ", already in cart: " + existing.getQuantity());
                existing.setQuantity(newQty);
            }, () -> cart.getItems().add(
                CartItem.builder().cart(cart).book(book).quantity(req.getQuantity()).build()
            ));

        return toResponse(cartRepository.save(cart));
    }

    public CartResponse updateItem(String sessionId, Long bookId, int quantity) {
        Cart cart = cartRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for session: " + sessionId));

        CartItem item = cart.getItems().stream()
            .filter(i -> i.getBook().getId().equals(bookId)).findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (!item.getBook().hasStock(quantity))
                throw new BusinessException("Insufficient stock. Available: " + item.getBook().getStock());
            item.setQuantity(quantity);
        }
        return toResponse(cartRepository.save(cart));
    }

    public CartResponse removeItem(String sessionId, Long bookId) {
        Cart cart = cartRepository.findBySessionId(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for session: " + sessionId));
        cart.getItems().removeIf(i -> i.getBook().getId().equals(bookId));
        return toResponse(cartRepository.save(cart));
    }

    public void clearCart(String sessionId) {
        cartRepository.findBySessionId(sessionId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
            .map(i -> {
                Book b = i.getBook();
                BigDecimal sub = b.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
                return CartItemResponse.builder()
                    .id(i.getId()).bookId(b.getId()).bookTitle(b.getTitle())
                    .bookAuthor(b.getAuthor()).coverUrl(b.getCoverUrl())
                    .unitPrice(b.getPrice()).quantity(i.getQuantity())
                    .subtotal(sub).availableStock(b.getStock()).build();
            }).toList();

        BigDecimal total = items.stream()
            .map(CartItemResponse::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
            .id(cart.getId()).sessionId(cart.getSessionId()).items(items)
            .totalAmount(total)
            .totalItems(items.stream().mapToInt(CartItemResponse::getQuantity).sum())
            .build();
    }
}
