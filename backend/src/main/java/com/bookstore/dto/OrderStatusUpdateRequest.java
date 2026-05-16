package com.bookstore.dto;
import com.bookstore.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderStatusUpdateRequest {
    @NotNull private OrderStatus status;
}
