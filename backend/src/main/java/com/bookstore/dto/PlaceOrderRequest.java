package com.bookstore.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlaceOrderRequest {
    @NotBlank @Size(max=200) private String customerName;
    @NotBlank @Email @Size(max=200) private String customerEmail;
    @Size(max=50) private String customerPhone;
    private String notes;
    private String sessionId;
}
