package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository   orderRepository;
    private final CartRepository    cartRepository;
    private final BookRepository    bookRepository;

    private static final AtomicLong SEQ = new AtomicLong(1000);

    @Transactional(readOnly = true)
    public Page<OrderResponse> findAll(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id) {
        return orderRepository.findByIdWithItems(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Transactional(readOnly = true)
    public OrderResponse findByOrderNumber(String num) {
        return orderRepository.findByOrderNumber(num)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + num));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findByEmail(String email) {
        return orderRepository.findAllByCustomerEmailOrderByCreatedAtDesc(email)
            .stream().map(this::toResponse).toList();
    }

    public OrderResponse placeOrder(PlaceOrderRequest req) {
        Cart cart = cartRepository.findBySessionId(req.getSessionId())
            .orElseThrow(() -> new BusinessException("Cart not found or empty. Please add books first."));
        if (cart.getItems().isEmpty())
            throw new BusinessException("Cannot place an order with an empty cart.");

        Order order = Order.builder()
            .orderNumber(generateOrderNumber())
            .customerName(req.getCustomerName())
            .customerEmail(req.getCustomerEmail())
            .customerPhone(req.getCustomerPhone())
            .notes(req.getNotes())
            .build();

        for (CartItem ci : cart.getItems()) {
            Book book = ci.getBook();
            if (!book.hasStock(ci.getQuantity()))
                throw new BusinessException("Insufficient stock for \"" + book.getTitle() +
                    "\". Available: " + book.getStock() + ", ordered: " + ci.getQuantity());

            OrderItem oi = OrderItem.builder()
                .book(book)
                .quantity(ci.getQuantity())
                .unitPrice(book.getPrice())
                .subtotal(book.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .build();
            order.addItem(oi);
            book.decreaseStock(ci.getQuantity());
            bookRepository.save(book);
        }
        order.recalculateTotal();
        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);
        log.info("Order {} placed by {}", saved.getOrderNumber(), req.getCustomerEmail());
        return toResponse(saved);
    }

    public OrderResponse updateStatus(Long id, OrderStatusUpdateRequest req) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.DELIVERED)
            throw new BusinessException("Cannot change status from " + order.getStatus());

        order.setStatus(req.getStatus());
        return toResponse(orderRepository.save(order));
    }

    private String generateOrderNumber() {
        return "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
            + "-" + String.format("%04d", SEQ.incrementAndGet());
    }

    public OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream()
            .map(i -> OrderItemResponse.builder()
                .id(i.getId()).bookId(i.getBook().getId())
                .bookTitle(i.getBook().getTitle()).bookAuthor(i.getBook().getAuthor())
                .quantity(i.getQuantity()).unitPrice(i.getUnitPrice()).subtotal(i.getSubtotal())
                .build())
            .toList();
        return OrderResponse.builder()
            .id(o.getId()).orderNumber(o.getOrderNumber())
            .customerName(o.getCustomerName()).customerEmail(o.getCustomerEmail())
            .customerPhone(o.getCustomerPhone()).status(o.getStatus())
            .totalAmount(o.getTotalAmount()).notes(o.getNotes())
            .items(items).createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt())
            .build();
    }
}
