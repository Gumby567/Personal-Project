package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public List<BookResponse> findAllActive() {
        return bookRepository.findAllByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    public Page<BookResponse> findWithFilters(String search, Long categoryId,
                                              BigDecimal minPrice, BigDecimal maxPrice,
                                              Pageable pageable) {
        return bookRepository.findWithFilters(search, categoryId, minPrice, maxPrice, pageable)
                             .map(this::toResponse);
    }

    public BookResponse findById(Long id) {
        return bookRepository.findByIdWithCategory(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    @Transactional
    public BookResponse create(BookRequest req) {
        Category cat = categoryRepository.findById(req.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));

        Book book = Book.builder()
            .title(req.getTitle())
            .author(req.getAuthor())
            .isbn(req.getIsbn())
            .description(req.getDescription())
            .price(req.getPrice())
            .stock(req.getStock())
            .coverUrl(req.getCoverUrl())
            .publisher(req.getPublisher())
            .publishedYear(req.getPublishedYear())
            .pages(req.getPages())
            .language(req.getLanguage() != null ? req.getLanguage() : "English")
            .isActive(req.getIsActive() != null ? req.getIsActive() : true)
            .category(cat)
            .build();

        Book saved = bookRepository.save(book);
        log.info("Created book id={} title={}", saved.getId(), saved.getTitle());
        return toResponse(saved);
    }

    @Transactional
    public BookResponse update(Long id, BookUpdateRequest req) {
        Book book = bookRepository.findByIdWithCategory(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));

        if (req.getTitle()         != null) book.setTitle(req.getTitle());
        if (req.getAuthor()        != null) book.setAuthor(req.getAuthor());
        if (req.getIsbn()          != null) book.setIsbn(req.getIsbn());
        if (req.getDescription()   != null) book.setDescription(req.getDescription());
        if (req.getPrice()         != null) book.setPrice(req.getPrice());
        if (req.getStock()         != null) book.setStock(req.getStock());
        if (req.getCoverUrl()      != null) book.setCoverUrl(req.getCoverUrl());
        if (req.getPublisher()     != null) book.setPublisher(req.getPublisher());
        if (req.getPublishedYear() != null) book.setPublishedYear(req.getPublishedYear());
        if (req.getPages()         != null) book.setPages(req.getPages());
        if (req.getLanguage()      != null) book.setLanguage(req.getLanguage());
        if (req.getIsActive()      != null) book.setIsActive(req.getIsActive());
        if (req.getCategoryId()    != null) {
            Category cat = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", req.getCategoryId()));
            book.setCategory(cat);
        }
        return toResponse(bookRepository.save(book));
    }

    @Transactional
    public void delete(Long id) {
        if (!bookRepository.existsById(id)) throw new ResourceNotFoundException("Book", id);
        bookRepository.deleteById(id);
        log.info("Deleted book id={}", id);
    }

    public List<CategoryResponse> findAllCategories() {
        return categoryRepository.findAll().stream()
            .map(c -> CategoryResponse.builder()
                .id(c.getId()).name(c.getName()).description(c.getDescription()).build())
            .toList();
    }

    public BookResponse toResponse(Book b) {
        return BookResponse.builder()
            .id(b.getId()).title(b.getTitle()).author(b.getAuthor()).isbn(b.getIsbn())
            .description(b.getDescription()).price(b.getPrice()).stock(b.getStock())
            .coverUrl(b.getCoverUrl()).publisher(b.getPublisher())
            .publishedYear(b.getPublishedYear()).pages(b.getPages()).language(b.getLanguage())
            .isActive(b.getIsActive())
            .categoryId(b.getCategory()   != null ? b.getCategory().getId()   : null)
            .categoryName(b.getCategory() != null ? b.getCategory().getName() : null)
            .createdAt(b.getCreatedAt()).updatedAt(b.getUpdatedAt())
            .build();
    }
}
