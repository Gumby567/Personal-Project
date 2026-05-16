package com.bookstore.service;

import com.bookstore.dto.*;
import com.bookstore.entity.*;
import com.bookstore.exception.*;
import com.bookstore.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookService — unit tests")
class BookServiceTest {

    @Mock BookRepository     bookRepository;
    @Mock CategoryRepository categoryRepository;
    @InjectMocks BookService bookService;

    private Category fiction;
    private Book     gatsby;

    @BeforeEach
    void setUp() {
        fiction = Category.builder().id(1L).name("Fiction").description("Novels").build();
        gatsby  = Book.builder().id(1L).title("The Great Gatsby").author("F. Scott Fitzgerald")
            .price(new BigDecimal("9.99")).stock(42).isActive(true).category(fiction).build();
    }

    // ── findAllActive ─────────────────────────────────────
    @Test @DisplayName("findAllActive returns mapped responses")
    void findAllActive_returnsMapped() {
        when(bookRepository.findAllByIsActiveTrue()).thenReturn(List.of(gatsby));
        var result = bookService.findAllActive();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("The Great Gatsby");
        assertThat(result.get(0).getCategoryName()).isEqualTo("Fiction");
    }

    @Test @DisplayName("findAllActive returns empty list when none active")
    void findAllActive_empty() {
        when(bookRepository.findAllByIsActiveTrue()).thenReturn(List.of());
        assertThat(bookService.findAllActive()).isEmpty();
    }

    // ── findById ──────────────────────────────────────────
    @Test @DisplayName("findById returns book when found")
    void findById_found() {
        when(bookRepository.findByIdWithCategory(1L)).thenReturn(Optional.of(gatsby));
        var res = bookService.findById(1L);
        assertThat(res.getId()).isEqualTo(1L);
        assertThat(res.getPrice()).isEqualByComparingTo("9.99");
    }

    @Test @DisplayName("findById throws ResourceNotFoundException when missing")
    void findById_throws() {
        when(bookRepository.findByIdWithCategory(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> bookService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class).hasMessageContaining("99");
    }

    // ── create ────────────────────────────────────────────
    @Test @DisplayName("create persists and returns new book")
    void create_success() {
        var req = BookRequest.builder().title("1984").author("George Orwell")
            .price(new BigDecimal("8.49")).stock(60).categoryId(1L).build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(fiction));
        when(bookRepository.save(any())).thenAnswer(inv -> { var b=(Book)inv.getArgument(0); b.setId(2L); return b; });

        var res = bookService.create(req);
        assertThat(res.getTitle()).isEqualTo("1984");
        assertThat(res.getCategoryName()).isEqualTo("Fiction");
        verify(bookRepository).save(any(Book.class));
    }

    @Test @DisplayName("create throws when category not found")
    void create_categoryMissing() {
        var req = BookRequest.builder().title("X").author("Y").price(BigDecimal.ONE)
            .stock(1).categoryId(99L).build();
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> bookService.create(req))
            .isInstanceOf(ResourceNotFoundException.class).hasMessageContaining("Category");
    }

    @Test @DisplayName("create defaults language to English when null")
    void create_defaultLanguage() {
        var req = BookRequest.builder().title("T").author("A")
            .price(BigDecimal.ONE).stock(1).categoryId(1L).build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(fiction));
        when(bookRepository.save(any())).thenAnswer(inv -> { var b=(Book)inv.getArgument(0); b.setId(3L); return b; });
        assertThat(bookService.create(req).getLanguage()).isEqualTo("English");
    }

    // ── update ────────────────────────────────────────────
    @Test @DisplayName("update applies only non-null fields")
    void update_partialFields() {
        when(bookRepository.findByIdWithCategory(1L)).thenReturn(Optional.of(gatsby));
        when(bookRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = BookUpdateRequest.builder().price(new BigDecimal("12.00")).stock(100).build();
        var res = bookService.update(1L, req);
        assertThat(res.getPrice()).isEqualByComparingTo("12.00");
        assertThat(res.getStock()).isEqualTo(100);
        assertThat(res.getTitle()).isEqualTo("The Great Gatsby"); // unchanged
    }

    @Test @DisplayName("update throws when book not found")
    void update_notFound() {
        when(bookRepository.findByIdWithCategory(77L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> bookService.update(77L, new BookUpdateRequest()))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── delete ────────────────────────────────────────────
    @Test @DisplayName("delete removes existing book")
    void delete_exists() {
        when(bookRepository.existsById(1L)).thenReturn(true);
        bookService.delete(1L);
        verify(bookRepository).deleteById(1L);
    }

    @Test @DisplayName("delete throws when book not found")
    void delete_notFound() {
        when(bookRepository.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> bookService.delete(99L))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(bookRepository, never()).deleteById(any());
    }

    // ── findWithFilters ───────────────────────────────────
    @Test @DisplayName("findWithFilters delegates to repository and maps results")
    void findWithFilters_delegates() {
        when(bookRepository.findWithFilters(any(), any(), any(), any(), any()))
            .thenReturn(new PageImpl<>(List.of(gatsby)));
        var page = bookService.findWithFilters("gatsby", null, null, null, PageRequest.of(0,10));
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTitle()).isEqualTo("The Great Gatsby");
    }

    // ── findAllCategories ─────────────────────────────────
    @Test @DisplayName("findAllCategories returns all categories")
    void findAllCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(fiction));
        var cats = bookService.findAllCategories();
        assertThat(cats).hasSize(1);
        assertThat(cats.get(0).getName()).isEqualTo("Fiction");
    }
}
