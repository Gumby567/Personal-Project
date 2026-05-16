package com.bookstore.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookUpdateRequest {
    private String title;
    private String author;
    private String isbn;
    private String description;
    @DecimalMin("0.0") @Digits(integer=8,fraction=2) private BigDecimal price;
    @Min(0) private Integer stock;
    private String coverUrl;
    private String publisher;
    private Integer publishedYear;
    private Integer pages;
    private String language;
    private Boolean isActive;
    private Long categoryId;
}
