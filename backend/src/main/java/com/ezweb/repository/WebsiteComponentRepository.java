package com.ezweb.repository;

import com.ezweb.model.WebsiteComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebsiteComponentRepository extends JpaRepository<WebsiteComponent, Long> {

    List<WebsiteComponent> findByWebsiteIdOrderByPositionAsc(Long websiteId);

    List<WebsiteComponent> findByWebsiteIdAndVisibleTrueOrderByPositionAsc(Long websiteId);

    void deleteByWebsiteId(Long websiteId);
}
