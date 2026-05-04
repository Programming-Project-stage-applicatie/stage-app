ALTER TABLE internship_requests 
MODIFY COLUMN status ENUM(
    'submitted',
    'approved',
    'adjustment_required',
    'rejected'
) NOT NULL DEFAULT 'submitted';