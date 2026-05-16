package com.bookstore.dto;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookRequest {
    @NotBlank(message="Title is required") private String title;
    @NotBlank(message="Author is required") private String author;
    private String isbn;
    private String description;
    @NotNull @DecimalMin("0.0") @Digits(integer=8,fraction=2) private BigDecimal price;
    @NotNull @Min(0) private Integer stock;
    private String coverUrl;
    private String publisher;
    private Integer publishedYear;
    private Integer pages;
    private String language;
    private Boolean isActive;
    @NotNull(message="Category is required") private Long categoryId;
}
