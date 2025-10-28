package com.ezweb.repository;

import com.ezweb.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByWebsiteId(Long websiteId);

    List<Product> findByWebsiteIdAndAvailableTrue(Long websiteId);

    List<Product> findByWebsiteIdAndCategory(Long websiteId, String category);

    void deleteByWebsiteId(Long websiteId);
}
