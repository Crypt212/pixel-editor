# Pixel Editor

A simple pixel editor web application that allows users to create and edit pixel art using a grid-based interface. This application is under development.

## Table of Contents

- [Overview](#overview)
- [Current Status](#current-status)
- [Planned Features](#planned-features)
- [Recent Improvements](#recent-improvements)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [License](#license)
- [Contact](#contact)

## Overview

This project aims to provide a user-friendly interface for creating pixel art, with features such as undo/redo functionality, color selection, and pixel manipulation. The application has been refactored to improve modularity and maintainability by introducing several manager classes:

- **CanvasManager**: Manages the canvas element and its properties.
- **DrawingManager**: Handles drawing operations and pixel manipulations.
- **EventManager**: Manages user interactions and events for the pixel editor.
- **ToolManager**: Oversees tool functionalities and interactions.

The `HistorySystem` module is implemented to manage the undo and redo actions.

## Current Status  
- ✅ Robust undo/redo system 
- 🚧 Core drawing tools implemented *(in progress)*
    - finished: pencil, eraser, line, bucket
    - in progress: color picker, area selection, magic wand
- 🚧 Layers *(in progress)*  

## Planned Features 
- Export to GIF
- Editiable color palletes
- Responsive design

## Recent Improvements

### Performance Optimizations (v0.5)
- 🚀 Undo/redo system now handles 1000-step actions 5x faster (384ms → 65ms)
- 🧹 Reduced memory usage by 30% in history operations

### Core Enhancements
- Refactored to modular architecture (CanvasManager, ToolManager, etc.)
- Implemented robust history system with merge optimization

## Installation

To run the pixel editor locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/Crypt212/pixel-editor.git
    ```

2. Navigate to the project directory:
    ```bash
    cd pixel-editor
    ```

3. Open `index.html` in your web browser.

## Running Tests

To run the tests for the pixel editor locally, follow these steps:
```bash
    npm test
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, feel free to reach out:

<ul>
    <li> **Ahmed El-esseily** - ahmed.elesseily.d@gmail.com
</ul>
