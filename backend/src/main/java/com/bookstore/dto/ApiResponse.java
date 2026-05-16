package com.bookstore.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    public static <T> ApiResponse<T> ok(T data)                { return new ApiResponse<>(true,  null, data); }
    public static <T> ApiResponse<T> ok(String msg, T data)    { return new ApiResponse<>(true,  msg,  data); }
    public static <T> ApiResponse<T> err(String msg)           { return new ApiResponse<>(false, msg,  null); }
}
