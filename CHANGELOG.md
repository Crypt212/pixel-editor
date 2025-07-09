# Changelog

## [v1.0.0] - 2025-7-10

### Changed
- Codebase conversion to Typescript enforcing strict typing and code maintainability
- History and change systems converted to generic types
- Pixel layer refactored endAction and cancelAction methods to delete action if empty. cancelAction method does not commit when cancelling 


### Added
- Scalable tool services system allowing extensible tool variations
- Pencil Tool, Line Tool, Eraser Tool, Bucket Tool
- Preview layer to layer manager for showing preview of what will be painted
- Event emitting system for tool services with UI events
