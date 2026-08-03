## ADDED Requirements

### Requirement: Weather field removed from daily progress entry
The Log Daily Progress add/edit form SHALL NOT present a Weather field, and the daily progress entries table SHALL NOT display a Weather column. `daily_progress_entries` SHALL NOT carry a `weather` column.

#### Scenario: Logging a daily progress entry
- **WHEN** a user opens the Log Daily Progress add or edit form
- **THEN** no Weather field is present

#### Scenario: Viewing the daily progress entries table
- **WHEN** a user views the daily progress entries table
- **THEN** no Weather column is present

#### Scenario: Pre-existing entries are unaffected apart from losing their weather value
- **WHEN** an entry logged before this requirement was in effect previously had a weather value
- **THEN** that entry continues to exist and function as before, with its weather value permanently removed
