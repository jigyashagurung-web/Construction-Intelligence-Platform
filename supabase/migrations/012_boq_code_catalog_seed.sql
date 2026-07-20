-- =====================================================================
-- BOQ Code Catalog: seed data
-- =====================================================================
-- Transcribed from the "EN_BOQ_Coded_Revit_Integration" v1.0 source
-- spreadsheet ("BOQ with Codes" and "Ch_Sub" tabs).
--
-- COMPLETENESS NOTE: Chapters 01–06 are fully transcribed (every
-- sub-chapter, section, and line item visible in the source). Chapter
-- 07 (Plumbing Works) sub-chapter 07.10 (UPVC Drainage Pipe) is fully
-- transcribed; sub-chapters 07.20–07.70 (CPVC Hot/Cold Pipe, Water
-- Tank & Pump, Sanitary Fixtures, Plumbing Accessories, Bathroom
-- Accessories, Water Filter & Accessories) are seeded as sub-chapter
-- shells only (code + description from the "Ch_Sub" master list) —
-- their section/line-item breakdown was not visible in the source and
-- must be added via a follow-up migration once the full spreadsheet
-- export is available. Do not treat this seed as a complete catalog
-- for chapter 07 beyond 07.10.

insert into boq_code_catalog (code, parent_code, level, description, unit, revit_category, family_type) values

-- ---------------------------------------------------------------------
-- 01 SITE DEVELOPMENT WORKS
-- ---------------------------------------------------------------------
('01.00.00.00', null,         'chapter',     'SITE DEVELOPMENT WORKS',      null, 'Site',                 null),
('01.10.00.00', '01.00.00.00','sub_chapter', 'Site Labour Camp',            null, 'Temporary Structure',  'Temporary Building'),
('01.10.10.00', '01.10.00.00','section',     'Site Clearance',              null, 'Site',                 'Clearing'),
('01.10.10.01', '01.10.10.00','line_item',   'Clearing and grubbing',       'm²', 'Site',                 'Clearing'),

('01.20.00.00', '01.00.00.00','sub_chapter', 'PROTECTION WORK',             null, 'Structural Foundation', null),
('01.20.10.00', '01.20.00.00','section',     'Protection Pile Work',        null, 'Structural Foundation', 'Pile'),
('01.20.10.01', '01.20.10.00','line_item',   'Protection Pile work',        'm',  'Structural Foundation', 'Pile'),
('01.20.20.00', '01.20.00.00','section',     'Pile Cap',                    null, 'Structural Foundation', 'Pile Cap'),
('01.20.20.01', '01.20.20.00','line_item',   'Pile Cap concrete',           'm³', 'Structural Foundation', 'Pile Cap'),
('01.20.30.00', '01.20.00.00','section',     'Fencing Work',                null, 'Site',                 'Fence'),
('01.20.30.01', '01.20.30.00','line_item',   'Chain link / hoarding fence', 'm',  'Site',                 'Fence'),

-- ---------------------------------------------------------------------
-- 02 CIVIL WORK
-- ---------------------------------------------------------------------
('02.00.00.00', null,         'chapter',     'CIVIL WORK',                  null, 'Structural', null),

('02.10.00.00', '02.00.00.00','sub_chapter', 'EARTHWORKS',                  null, 'Topography', null),
('02.10.10.00', '02.10.00.00','section',     'Earthwork Excavation',        null, 'Topography', 'Excavation'),
('02.10.10.01', '02.10.10.00','line_item',   'Earthwork excavation work',   'm³', 'Topography', 'Excavation'),
('02.10.10.02', '02.10.10.00','line_item',   'Disposal of excavated soil',  'm³', 'Topography', 'Soil Disposal'),
('02.10.10.03', '02.10.10.00','line_item',   'Back filling earth work',     'm³', 'Topography', 'Backfill'),

('02.20.00.00', '02.00.00.00','sub_chapter', 'SOLING WORK',                 null, 'Structural Foundation', null),
('02.20.10.00', '02.20.00.00','section',     'Dry Boulder Soling',          null, 'Structural Foundation', 'Boulder Soling'),
('02.20.10.01', '02.20.10.00','line_item',   'Dry boulder soling 6" thick', 'm³', 'Structural Foundation', 'Boulder Soling'),
('02.20.10.02', '02.20.10.00','line_item',   'Dry boulder soling 12" thick','m³', 'Structural Foundation', 'Boulder Soling'),
('02.20.20.00', '02.20.00.00','section',     'Brick Soling',                null, 'Structural Foundation', 'Brick Soling'),
('02.20.20.01', '02.20.20.00','line_item',   'Brick soling work',           'm³', 'Structural Foundation', 'Brick Soling'),

('02.30.00.00', '02.00.00.00','sub_chapter', 'PCC WORK',                    null, 'Structural Foundation', null),
('02.30.10.00', '02.30.00.00','section',     'PCC 1:3:6',                   null, 'Structural Foundation', 'PCC'),
('02.30.10.01', '02.30.10.00','line_item',   'PCC 1:3:6 work',              'm³', 'Structural Foundation', 'PCC'),
('02.30.20.00', '02.30.00.00','section',     'PCC 1:2:4',                   null, 'Structural Foundation', 'PCC'),
('02.30.20.01', '02.30.20.00','line_item',   'PCC 1:2:4 work',              'm³', 'Structural Foundation', 'PCC'),

('02.40.00.00', '02.00.00.00','sub_chapter', 'RCC WORKS',                   null, 'Structural', null),
('02.40.10.00', '02.40.00.00','section',     'RCC M15',                     null, 'Structural', 'Concrete'),
('02.40.10.01', '02.40.10.00','line_item',   'RCC (M15) – Blinding/Non-structural', 'm³', 'Structural', 'Concrete'),
('02.40.20.00', '02.40.00.00','section',     'RCC M20',                     null, 'Structural', 'Concrete'),
('02.40.20.01', '02.40.20.00','line_item',   'RCC (M20) – Footings/Slabs',  'm³', 'Structural', 'Concrete'),
('02.40.30.00', '02.40.00.00','section',     'RCC M25',                     null, 'Structural', 'Concrete'),
('02.40.30.01', '02.40.30.00','line_item',   'RCC (M25) – Beams/Columns',   'm³', 'Structural', 'Concrete'),
('02.40.40.00', '02.40.00.00','section',     'RCC M30',                     null, 'Structural', 'Concrete'),
('02.40.40.01', '02.40.40.00','line_item',   'RCC (M30) – High-strength elements', 'm³', 'Structural', 'Concrete'),

('02.50.00.00', '02.00.00.00','sub_chapter', 'REINFORCEMENT WORK',          null, 'Structural', 'Rebar'),
('02.50.10.00', '02.50.00.00','section',     'Mild Steel Bars',             null, 'Structural', 'Rebar'),
('02.50.10.01', '02.50.10.00','line_item',   '8 mm dia rebar',              'kg', 'Structural', 'Rebar'),
('02.50.10.02', '02.50.10.00','line_item',   '10 mm dia rebar',             'kg', 'Structural', 'Rebar'),
('02.50.10.03', '02.50.10.00','line_item',   '12 mm dia rebar',             'kg', 'Structural', 'Rebar'),
('02.50.10.04', '02.50.10.00','line_item',   '16 mm dia rebar',             'kg', 'Structural', 'Rebar'),
('02.50.10.05', '02.50.10.00','line_item',   '20 mm dia rebar',             'kg', 'Structural', 'Rebar'),
('02.50.10.06', '02.50.10.00','line_item',   '25 mm dia rebar',             'kg', 'Structural', 'Rebar'),
('02.50.10.07', '02.50.10.00','line_item',   '32 mm dia rebar',             'kg', 'Structural', 'Rebar'),

-- Form Work: no intermediate section row in the source; items attach
-- directly to the sub-chapter.
('02.60.00.00', '02.00.00.00','sub_chapter', 'FORM WORK',                   null, 'Structural', 'Formwork'),
('02.60.10.01', '02.60.00.00','line_item',   'Foundation formwork',         'm²', 'Structural Foundation', 'Formwork'),
('02.60.10.02', '02.60.00.00','line_item',   'Column formwork',             'm²', 'Structural Columns',    'Formwork'),
('02.60.10.03', '02.60.00.00','line_item',   'Beam formwork',               'm²', 'Structural Framing',    'Formwork'),
('02.60.10.04', '02.60.00.00','line_item',   'Slab formwork',               'm²', 'Floors',                'Formwork'),
('02.60.10.05', '02.60.00.00','line_item',   'Staircase formwork',          'm²', 'Stairs',                'Formwork'),

-- ---------------------------------------------------------------------
-- 03 MASONRY WORK
-- ---------------------------------------------------------------------
('03.00.00.00', null,         'chapter',     'MASONRY WORK',                null, 'Walls', null),

('03.10.00.00', '03.00.00.00','sub_chapter', 'BLOCK WALL WORK',             null, 'Walls', null),
('03.10.10.00', '03.10.00.00','section',     'Brick Wall',                  null, 'Walls', 'Basic Wall'),
('03.10.10.01', '03.10.10.00','line_item',   '4.5" brick wall work',        'm²', 'Walls', 'Basic Wall'),
('03.10.10.02', '03.10.10.00','line_item',   '9" brick wall work',          'm²', 'Walls', 'Basic Wall'),
('03.10.20.00', '03.10.00.00','section',     'ACC Block Wall',              null, 'Walls', 'Basic Wall'),
('03.10.20.01', '03.10.20.00','line_item',   '8" thick ACC block wall',     'm²', 'Walls', 'Basic Wall'),
('03.10.20.02', '03.10.20.00','line_item',   '6" thick ACC block wall',     'm²', 'Walls', 'Basic Wall'),

-- RCC Band Along Wall: no intermediate section row in the source.
('03.20.00.00', '03.00.00.00','sub_chapter', 'RCC BAND ALONG WALL',         null, 'Structural Framing', 'Band Beam'),
('03.20.10.01', '03.20.00.00','line_item',   'RCC band beam',               'm',  'Structural Framing', 'Band Beam'),

-- ---------------------------------------------------------------------
-- 04 FINISHES (no section-level rows for any sub-chapter in the source)
-- ---------------------------------------------------------------------
('04.00.00.00', null,         'chapter',     'FINISHES',                    null, 'Finishes', null),

('04.10.00.00', '04.00.00.00','sub_chapter', 'PLASTER WORK',                null, 'Finishes', null),
('04.10.10.01', '04.10.00.00','line_item',   'Internal plaster 12mm',       'm²', 'Walls',    'Wall Finish'),
('04.10.10.02', '04.10.00.00','line_item',   'External plaster 15mm',       'm²', 'Walls',    'Wall Finish'),
('04.10.10.03', '04.10.00.00','line_item',   'Ceiling plaster 10mm',        'm²', 'Ceilings', 'Ceiling Finish'),

('04.20.00.00', '04.00.00.00','sub_chapter', 'TILE WORK',                   null, 'Finishes', null),
('04.20.10.01', '04.20.00.00','line_item',   'Floor tile 600x600',          'm²', 'Floors',   'Floor Finish'),
('04.20.10.02', '04.20.00.00','line_item',   'Wall tile 300x450',           'm²', 'Walls',    'Wall Finish'),
('04.20.10.03', '04.20.00.00','line_item',   'Anti-skid floor tile',        'm²', 'Floors',   'Floor Finish'),

('04.30.00.00', '04.00.00.00','sub_chapter', 'PAINTING WORK',               null, 'Finishes', null),
('04.30.10.01', '04.30.00.00','line_item',   'Internal emulsion paint',     'm²', 'Walls',    'Paint Finish'),
('04.30.10.02', '04.30.00.00','line_item',   'External weather coat paint', 'm²', 'Walls',    'Paint Finish'),
('04.30.10.03', '04.30.00.00','line_item',   'Ceiling paint',               'm²', 'Ceilings', 'Paint Finish'),
('04.30.10.04', '04.30.00.00','line_item',   'Wood primer + paint',         'm²', 'Casework', 'Paint Finish'),

('04.40.00.00', '04.00.00.00','sub_chapter', 'SCREED WORK',                 null, 'Finishes', null),
('04.40.10.01', '04.40.00.00','line_item',   'Screeding on Floor',          'm²', 'Floors',       'Floor Finish'),
('04.40.10.02', '04.40.00.00','line_item',   'Punning',                     'm²', 'Floors/Walls', 'Floor/Wall Finish'),

-- ---------------------------------------------------------------------
-- 05 DOORS & WINDOWS (no section-level rows in the source)
-- ---------------------------------------------------------------------
('05.00.00.00', null,         'chapter',     'DOORS & WINDOWS',             null, 'Openings', null),

('05.10.00.00', '05.00.00.00','sub_chapter', 'DOOR WORK',                   null, 'Doors', null),
('05.10.10.01', '05.10.00.00','line_item',   'Main entry door (teak)',      'Nr', 'Doors', 'Single Flush'),
('05.10.10.02', '05.10.00.00','line_item',   'Internal flush door',         'Nr', 'Doors', 'Single Flush'),
('05.10.10.03', '05.10.00.00','line_item',   'Bathroom door (WPC)',         'Nr', 'Doors', 'Single Flush'),

('05.20.00.00', '05.00.00.00','sub_chapter', 'WINDOW WORK',                 null, 'Windows', null),
('05.20.10.01', '05.20.00.00','line_item',   'UPVC sliding window',         'Nr', 'Windows', 'Fixed'),
('05.20.10.02', '05.20.00.00','line_item',   'UPVC casement window',        'Nr', 'Windows', 'Casement'),
('05.20.10.03', '05.20.00.00','line_item',   'Ventilator / louvre',         'Nr', 'Windows', 'Louvre'),

-- ---------------------------------------------------------------------
-- 06 ELECTRICAL WORKS (no section-level rows in the source)
-- ---------------------------------------------------------------------
('06.00.00.00', null,         'chapter',     'ELECTRICAL WORKS',            null, 'Electrical', null),

('06.10.00.00', '06.00.00.00','sub_chapter', 'WIRING & CONDUIT',            null, 'Electrical', null),
('06.10.10.01', '06.10.00.00','line_item',   '1.5 sq.mm PVC wire',          'm',  'Electrical Fixtures', 'Wire'),
('06.10.10.02', '06.10.00.00','line_item',   '2.5 sq.mm PVC wire',          'm',  'Electrical Fixtures', 'Wire'),
('06.10.10.03', '06.10.00.00','line_item',   '4.0 sq.mm PVC wire',          'm',  'Electrical Fixtures', 'Wire'),
('06.10.10.04', '06.10.00.00','line_item',   '20mm PVC conduit',            'm',  'Electrical Fixtures', 'Conduit'),

('06.20.00.00', '06.00.00.00','sub_chapter', 'FIXTURES & FITTINGS',         null, 'Electrical Fixtures', null),
('06.20.10.01', '06.20.00.00','line_item',   'MCB distribution board',      'Nr', 'Electrical Equipment', 'DB Panel'),
('06.20.10.02', '06.20.00.00','line_item',   '20A MCB breaker',             'Nr', 'Electrical Equipment', 'MCB'),
('06.20.20.01', '06.20.00.00','line_item',   'LED light fitting (surface)', 'Nr', 'Lighting Fixtures',    'LED Fixture'),
('06.20.20.02', '06.20.00.00','line_item',   'Fan point',                   'Nr', 'Electrical Fixtures',  'Fan'),
('06.20.20.03', '06.20.00.00','line_item',   'Socket outlet 5/15A',         'Nr', 'Electrical Fixtures',  'Outlet'),
('06.20.20.04', '06.20.00.00','line_item',   'Switch 2-way',                'Nr', 'Electrical Fixtures',  'Switch'),

-- ---------------------------------------------------------------------
-- 07 PLUMBING WORKS
-- Only 07.10 is fully detailed; 07.20–07.70 are sub-chapter shells
-- pending the full spreadsheet export (see completeness note above).
-- ---------------------------------------------------------------------
('07.00.00.00', null,         'chapter',     'PLUMBING WORKS',              null, 'Plumbing', null),

('07.10.00.00', '07.00.00.00','sub_chapter', 'UPVC DRAINAGE PIPE',          null, 'Plumbing', null),
('07.10.10.01', '07.10.00.00','line_item',   '75mm UPVC SWR pipe',          'm',  'Pipe Fittings', 'Round'),
('07.10.10.02', '07.10.00.00','line_item',   '110mm UPVC SWR pipe',         'm',  'Pipe Fittings', 'Round'),
-- unit column was cut off in the source screenshot for this row; left null pending verification
('07.10.20.01', '07.10.00.00','line_item',   '110mm Bend 45°',              null, 'Pipe Fittings', 'Elbow'),

('07.20.00.00', '07.00.00.00','sub_chapter', 'CPVC HOT/COLD PIPE',          null, 'Plumbing', null),
('07.30.00.00', '07.00.00.00','sub_chapter', 'WATER TANK & PUMP',           null, 'Plumbing', null),
('07.40.00.00', '07.00.00.00','sub_chapter', 'SANITARY FIXTURES',           null, 'Plumbing', null),
('07.50.00.00', '07.00.00.00','sub_chapter', 'PLUMBING ACCESSORIES',        null, 'Plumbing', null),
('07.60.00.00', '07.00.00.00','sub_chapter', 'BATHROOM ACCESSORIES',        null, 'Plumbing', null),
('07.70.00.00', '07.00.00.00','sub_chapter', 'WATER FILTER & ACCESSORIES',  null, 'Plumbing', null);
