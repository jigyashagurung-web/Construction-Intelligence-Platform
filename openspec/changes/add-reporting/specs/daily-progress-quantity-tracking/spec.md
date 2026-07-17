## ADDED Requirements

### Requirement: Diary entries support optional photo attachments
A daily progress entry MAY have one or more photos attached at creation or edit time, stored independently of the entry row and associated back to it.

#### Scenario: Attaching a photo when logging an entry
- **WHEN** a user with permission to log diary entries (admin, project_manager, site_engineer) uploads one or more photos while submitting the Log Daily Progress form
- **THEN** each photo SHALL be stored and associated with the created entry, and SHALL appear as a thumbnail in the Daily Progress table row for that entry

#### Scenario: Submitting an entry without a photo
- **WHEN** a user submits the Log Daily Progress form without attaching any photo
- **THEN** the entry SHALL be created successfully with no photos attached

#### Scenario: Deleting a diary entry removes its photos
- **WHEN** a diary entry with attached photos is deleted
- **THEN** its associated photo records SHALL also be removed

#### Scenario: Viewing photos requires project membership
- **WHEN** a user outside the entry's project organisation attempts to access a photo's storage path
- **THEN** access SHALL be denied, consistent with the entry's own read-access scoping
