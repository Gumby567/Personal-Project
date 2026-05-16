package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.*;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findAllByIsActiveTrue();

    @Query("""
        SELECT b FROM Book b JOIN FETCH b.category c
        WHERE b.isActive = true
        AND (:search IS NULL OR LOWER(b.title)  LIKE LOWER(CONCAT('%',:search,'%'))
                             OR LOWER(b.author) LIKE LOWER(CONCAT('%',:search,'%')))
        AND (:categoryId IS NULL OR c.id = :categoryId)
        AND (:minPrice   IS NULL OR b.price >= :minPrice)
        AND (:maxPrice   IS NULL OR b.price <= :maxPrice)
        """)
    Page<Book> findWithFilters(
        @Param("search")     String search,
        @Param("categoryId") Long categoryId,
        @Param("minPrice")   BigDecimal minPrice,
        @Param("maxPrice")   BigDecimal maxPrice,
        Pageable pageable
    );

    @Query("SELECT b FROM Book b JOIN FETCH b.category WHERE b.id = :id")
    Optional<Book> findByIdWithCategory(@Param("id") Long id);
}
