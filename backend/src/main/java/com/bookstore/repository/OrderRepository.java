package com.bookstore.repository;

import com.bookstore.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findAllByStatus(OrderStatus status, Pageable pageable);
    List<Order> findAllByCustomerEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT o FROM Order o JOIN FETCH o.items i JOIN FETCH i.book WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
