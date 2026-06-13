package com.shootingstar.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "assignment_languages")
public class AssignmentLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(name = "language", length = 32, nullable = false)
    private String language;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
