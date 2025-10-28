package com.ezweb.repository;

import com.ezweb.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByWebsiteId(Long websiteId);

    List<Media> findByWebsiteIdAndType(Long websiteId, Media.MediaType type);

    void deleteByWebsiteId(Long websiteId);
}
