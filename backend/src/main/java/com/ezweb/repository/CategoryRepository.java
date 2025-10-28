package com.ezweb.repository;

import com.ezweb.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByWebsiteIdOrderByNameAsc(Long websiteId);
    List<Category> findByWebsiteIdAndActiveTrue(Long websiteId);
}
