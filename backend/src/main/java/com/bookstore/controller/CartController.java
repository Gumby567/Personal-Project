package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
public class CartController {

    private final CartService cartService;

    /** US2 — Get the current cart for a session */
    @GetMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@PathVariable String sessionId) {
        return ResponseEntity.ok(ApiResponse.ok(cartService.getCart(sessionId)));
    }

    /** US2 — Add a book to the cart */
    @PostMapping("/{sessionId}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @PathVariable String sessionId,
            @Valid @RequestBody CartItemRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Book added to cart", cartService.addItem(sessionId, req)));
    }

    /** US2 — Update quantity */
    @PutMapping("/{sessionId}/items/{bookId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @PathVariable String sessionId,
            @PathVariable Long bookId,
            @RequestBody Map<String,Integer> body) {
        return ResponseEntity.ok(ApiResponse.ok(
            cartService.updateItem(sessionId, bookId, body.getOrDefault("quantity", 0))));
    }

    /** US2 — Remove one book from cart */
    @DeleteMapping("/{sessionId}/items/{bookId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable String sessionId, @PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.ok("Item removed", cartService.removeItem(sessionId, bookId)));
    }

    /** Clear entire cart */
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", null));
    }
}
