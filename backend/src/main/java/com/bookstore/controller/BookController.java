package com.bookstore.controller;

import com.bookstore.dto.*;
import com.bookstore.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:3000"})
public class BookController {

    private final BookService bookService;

    /** US1 — Browse all available books with optional filtering & pagination */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookResponse>>> browse(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0")    int page,
            @RequestParam(defaultValue = "12")   int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<BookResponse> result = bookService.findWithFilters(
            search, categoryId, minPrice, maxPrice, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bookService.findById(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> categories() {
        return ResponseEntity.ok(ApiResponse.ok(bookService.findAllCategories()));
    }

    /** US4 — Admin: add a book */
    @PostMapping
    public ResponseEntity<ApiResponse<BookResponse>> create(
            @Valid @RequestBody BookRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Book created successfully", bookService.create(req)));
    }

    /** US4 — Admin: edit a book */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> update(
            @PathVariable Long id, @Valid @RequestBody BookUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Book updated", bookService.update(id, req)));
    }

    /** US4 — Admin: remove a book */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Book deleted", null));
    }
}
