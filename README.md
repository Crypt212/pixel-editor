# Pixelaria
**[🚀 Live Demo](https://crypt212.github.io/pixelaria/)**

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

![Alt drawing](https://media.giphy.com/media/kzYVkVeXPIl7dRSLnN/giphy.gif)
![Alt erasing](https://media.giphy.com/media/TQjr3VtD4pgttsJY57/giphy.gif)
![Alt filling](https://media.giphy.com/media/q59VyPECMBzb9uJJ2Z/giphy.gif)

This project aims to provide a user-friendly interface for creating pixel art, with features such as undo/redo functionality, color selection, pixel manipulation and basic tools (pencil, eraser, line, bucket). The application has been refactored to improve modularity, maintainability and scalability by introducing:

### Managers
- **ToolManager**: Oversees tool functionalities and interactions.
- **LayerManager**: Manages layers and their properties (Will be supported for UI soon).

### Generic Systems
- **HistorySystem**: Manages records in history buffer for undo/redo operations.
- **ChangeSystem**: Manages and records changes done to a collection of data, storing it before and after states.

### General Services
- **Color**: Manages and caches all used colors in application, and provide color manipulation utilities.
- **EventEmitter**: Manages interactions between UI components and the application core logic.
- **PixelChange**: Specification of ChangeSystem class for pixel manipulation.

### Tools
- **ToolService**: Manages services for tools. Composing various tools from collections of services allowing scalability.
- **ServiceConfig**: Manages configuration of tool services.

### UI Components
- Allowiing interactions with the core logic.


## Current Status  
- ✅ Robust undo/redo system 
- ✅ scalable tool interfaces and services
- ✅ basic tools: pencil, eraser, line, bucket
- ✅ random
- 🚧 Layers *(in progress)*  

## Planned Features 
- color picker, area selection, magic wand
- Export to GIF
- Editiable color palletes
- Responsive design

## Recent Improvements

### Performance Optimizations (v0.5)
- Undo/redo system now handles 1000-step actions 5x faster (384ms → 65ms)
- Caching pixel changes and used colors, reducing memory usage by 30%
- Reduced memory usage by 30% in history operations

## Installation

To run the pixel editor locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/Crypt212/pixelaria.git
    ```

2. Build the project:
    ```bash
    cd pixelaria
    npm install
    npm run build
    ```

3. Preview:
    ```bash
    npm run preview
    ```

## Running Tests

To run the tests for the pixel editor locally, follow these steps:
```bash
    npm test
```

*Note: Project still in development and tests are under construction.*

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, feel free to reach out:

<ul>
    <li> **Ahmed El-esseily** - ahmed.elesseily.d@gmail.com
</ul>
