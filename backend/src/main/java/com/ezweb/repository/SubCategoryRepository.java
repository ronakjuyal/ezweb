package com.ezweb.repository;

import com.ezweb.model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    List<SubCategory> findByCategoryIdOrderByNameAsc(Long categoryId);
    List<SubCategory> findByCategoryIdAndActiveTrue(Long categoryId);
}
