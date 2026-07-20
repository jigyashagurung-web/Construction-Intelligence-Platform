-- =====================================================================
-- BOQ Code Catalog: complete Plumbing Works (chapter 07) seed data
-- =====================================================================
-- The initial seed (012_boq_code_catalog_seed.sql) only had visibility
-- into sub-chapter 07.10 (UPVC Drainage Pipe); sub-chapters 07.20–07.70
-- were seeded as shells (code + description only, no line items). The
-- full source spreadsheet for chapter 07 is now available (rows
-- 105–149, the last rows of the sheet) — this migration fills in the
-- missing line items and corrects a few Revit-category values on the
-- sub-chapter shell rows that were placeholder-guessed as 'Plumbing'
-- but are actually more specific in the source.

update boq_code_catalog set unit = 'Nr' where code = '07.10.20.01';

update boq_code_catalog set revit_category = 'Plumbing Fixtures'   where code = '07.40.00.00';
update boq_code_catalog set revit_category = 'Plumbing Fixtures'   where code = '07.50.00.00';
update boq_code_catalog set revit_category = 'Specialty Equipment' where code = '07.60.00.00';

insert into boq_code_catalog (code, parent_code, level, description, unit, revit_category, family_type) values

-- 07.10 UPVC Drainage Pipe: remaining fittings
('07.10.20.02', '07.10.00.00', 'line_item', '110mm UPVC vent cowl',  'Nr', 'Pipe Fittings',      'Vent'),
('07.10.20.03', '07.10.00.00', 'line_item', '110mm plain door tee',  'Nr', 'Pipe Fittings',      'Tee'),
('07.10.20.04', '07.10.00.00', 'line_item', '110mm 90° bend',        'Nr', 'Pipe Fittings',      'Elbow'),
('07.10.20.05', '07.10.00.00', 'line_item', '110mm Y-branch',        'Nr', 'Pipe Fittings',      'Wye'),
('07.10.20.06', '07.10.00.00', 'line_item', '110x110mm P-trap',      'Nr', 'Plumbing Fixtures',  'P-trap'),

-- 07.20 CPVC Hot/Cold Pipe
('07.20.10.01', '07.20.00.00', 'line_item', '15mm CPVC pipe',        'm',  'Pipe Fittings', 'Round'),
('07.20.10.02', '07.20.00.00', 'line_item', '20mm CPVC pipe',        'm',  'Pipe Fittings', 'Round'),
('07.20.10.03', '07.20.00.00', 'line_item', '25mm CPVC pipe',        'm',  'Pipe Fittings', 'Round'),
('07.20.10.04', '07.20.00.00', 'line_item', '32mm CPVC pipe',        'm',  'Pipe Fittings', 'Round'),
('07.20.10.05', '07.20.00.00', 'line_item', '40mm CPVC pipe',        'm',  'Pipe Fittings', 'Round'),
('07.20.20.01', '07.20.00.00', 'line_item', '15mm CPVC ball valve',  'Nr', 'Pipe Fittings', 'Ball Valve'),
('07.20.20.02', '07.20.00.00', 'line_item', '20mm CPVC ball valve',  'Nr', 'Pipe Fittings', 'Ball Valve'),
('07.20.20.03', '07.20.00.00', 'line_item', '25mm CPVC ball valve',  'Nr', 'Pipe Fittings', 'Ball Valve'),
('07.20.20.04', '07.20.00.00', 'line_item', '32mm CPVC ball valve',  'Nr', 'Pipe Fittings', 'Ball Valve'),
('07.20.20.05', '07.20.00.00', 'line_item', '40mm CPVC ball valve',  'Nr', 'Pipe Fittings', 'Ball Valve'),
('07.20.20.06', '07.20.00.00', 'line_item', 'GM 40mm gate valve',    'Nr', 'Pipe Fittings', 'Gate Valve'),

-- 07.30 Water Tank & Pump
('07.30.10.01', '07.30.00.00', 'line_item', '1000 ltr HDPE water tank', 'Nr', 'Plumbing Fixtures',    'Storage Tank'),
('07.30.10.02', '07.30.00.00', 'line_item', '2 HP multistage pump',     'Nr', 'Mechanical Equipment', 'Pump'),

-- 07.40 Sanitary Fixtures
('07.40.10.01', '07.40.00.00', 'line_item', 'Fixing of commode (WC)', 'Nr', 'Plumbing Fixtures', 'Toilet'),
('07.40.10.02', '07.40.00.00', 'line_item', 'Fixing of wash basins',  'Nr', 'Plumbing Fixtures', 'Sink'),
('07.40.10.03', '07.40.00.00', 'line_item', 'Fixing of kitchen sink', 'Nr', 'Plumbing Fixtures', 'Sink'),
('07.40.10.04', '07.40.00.00', 'line_item', 'Fixing of urinal',       'Nr', 'Plumbing Fixtures', 'Urinal'),

-- 07.50 Plumbing Accessories
('07.50.10.01', '07.50.00.00', 'line_item', 'CP Bib cock',   'Nr', 'Plumbing Fixtures', 'Faucet'),
('07.50.10.02', '07.50.00.00', 'line_item', 'Angle valve',   'Nr', 'Plumbing Fixtures', 'Valve'),
('07.50.10.03', '07.50.00.00', 'line_item', 'Shower mixer',  'Nr', 'Plumbing Fixtures', 'Shower'),
('07.50.10.04', '07.50.00.00', 'line_item', 'Basin mixer',   'Nr', 'Plumbing Fixtures', 'Faucet'),
('07.50.10.05', '07.50.00.00', 'line_item', 'Commode spray', 'Nr', 'Plumbing Fixtures', 'Bidet Spray'),

-- 07.60 Bathroom Accessories
('07.60.10.01', '07.60.00.00', 'line_item', 'CP Toilet paper holder', 'Nr', 'Specialty Equipment', 'Accessory'),
('07.60.10.02', '07.60.00.00', 'line_item', 'CP Soap tray',           'Nr', 'Specialty Equipment', 'Accessory'),
('07.60.10.03', '07.60.00.00', 'line_item', 'SS towel rod',           'Nr', 'Specialty Equipment', 'Accessory'),
('07.60.10.04', '07.60.00.00', 'line_item', 'Looking mirror',         'Nr', 'Specialty Equipment', 'Mirror'),

-- 07.70 Water Filter & Accessories
('07.70.10.01', '07.70.00.00', 'line_item', 'Borewell water filter', 'Nr', 'Plumbing Fixtures', 'Filter'),
('07.70.10.02', '07.70.00.00', 'line_item', 'Drinking water filter', 'Nr', 'Plumbing Fixtures', 'Filter'),
('07.70.10.03', '07.70.00.00', 'line_item', 'Soak pit filter media',  'm²', 'Topography',  'Soak Pit'),
('07.70.10.04', '07.70.00.00', 'line_item', 'Cover slab & access',   'Nr', 'Structural',   'Cover Slab'),
('07.70.10.05', '07.70.00.00', 'line_item', 'Manhole cover',         'Nr', 'Site',         'Manhole Cover');
