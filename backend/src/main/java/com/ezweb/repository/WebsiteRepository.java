package com.ezweb.repository;

import com.ezweb.model.Website;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WebsiteRepository extends JpaRepository<Website, Long> {

    Optional<Website> findBySubdomain(String subdomain);

    List<Website> findByUserId(Long userId);

    Boolean existsBySubdomain(String subdomain);
}
