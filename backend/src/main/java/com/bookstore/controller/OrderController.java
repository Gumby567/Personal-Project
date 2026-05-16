package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
public class OrderController {

    private final OrderService orderService;

    /** US5 — Admin: list all orders */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
            orderService.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    /** US5 — Get single order by id */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.findById(id)));
    }

    /** US5 — Track order by order-number */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.findByOrderNumber(orderNumber)));
    }

    /** US5 — Get past orders for a customer email */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> myOrders(@RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.findByEmail(email)));
    }

    /** US3 — Confirm cart → place order */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest req) {
        OrderResponse order = orderService.placeOrder(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Order placed! Order #" + order.getOrderNumber(), order));
    }

    /** Admin: update order status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody OrderStatusUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", orderService.updateStatus(id, req)));
    }
}
