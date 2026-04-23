-- ============================================
-- Tabel: finale_evaluatie
-- ============================================
CREATE TABLE IF NOT EXISTS finale_evaluatie (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT            NOT NULL,
    omschrijving  TEXT           NULL,
    document_url  VARCHAR(500)   NULL,
    status        ENUM('Open', 'Ingediend', 'Geëvalueerd') NOT NULL DEFAULT 'Open',
    eindscore     DECIMAL(5, 2)  NULL,        -- ingevuld door begeleider
    motivatie     TEXT           NULL,         -- ingevuld door begeleider
    created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_fe_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Elke student heeft maximaal één finale evaluatie
CREATE UNIQUE INDEX uq_fe_student ON finale_evaluatie(student_id);
