package com.ezweb.repository;

import com.ezweb.model.ComponentRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComponentRegistryRepository extends JpaRepository<ComponentRegistry, Long> {

    Optional<ComponentRegistry> findByName(String name);

    List<ComponentRegistry> findByCategory(String category);

    List<ComponentRegistry> findByActiveTrue();

    Boolean existsByName(String name);
}
