INSERT INTO profiles (id, email, password_hash, role) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@mits.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'security@mits.ac.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'security')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (plate, full_name, department, phone) VALUES
  ('KL07CD1234', 'Rajesh Kumar', 'Computer Science', '9876543210'),
  ('TN09AB5678', 'Priya Sharma', 'Electronics', '9123456789'),
  ('KL08EF9012', 'Mohammed Ali', 'Mechanical', '9988776655')
ON CONFLICT (plate) DO NOTHING;
