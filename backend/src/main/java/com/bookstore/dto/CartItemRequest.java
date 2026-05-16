package com.bookstore.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {
    @NotNull private Long bookId;
    @NotNull @Min(1) private Integer quantity;
}
