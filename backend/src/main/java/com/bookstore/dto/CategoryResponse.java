package com.bookstore.dto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
}
