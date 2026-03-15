# ⚛️ Neu-Pack

A high-performance, lightweight desktop utility for analyzing and zipping project folders. Built with **Neutralinojs**, **React**, and **TypeScript**, it features a background **Node.js Extension** for non-blocking file compression.

## ✨ Key Features

- **⚡ Native Performance:** Leverages Neutralino's lightweight core to maintain a tiny memory footprint compared to Electron.
- **🔍 Deep Scan Engine:** Recursively analyzes directory structures to provide accurate file counts and total project size before zipping.
- **📂 Native Dialogs:** Seamless integration with the OS file explorer for project selection.
- **🔄 Real-time Progress:** A bi-directional communication bridge between the UI and the Node.js extension provides live percentage updates during compression.
- **🛡️ Robust File Handling:** Uses a `.tmp` atomic-write strategy to ensure zip files are never corrupted if a process is interrupted.
- **🎨 Modern UI/UX:** Built with Tailwind CSS and Framer Motion for smooth, spring-based animations and "Developer Tool" aesthetics.

## 🏗️ Architecture

Neu-Pack uses a three-tier architecture to ensure the UI remains responsive even during heavy I/O tasks:

1. **Frontend (React + Vite):** Handles the state management, animations, and recursive directory calculations.
2. **Native Bridge (Neutralino API):** Provides access to the filesystem, native OS dialogs, and system events.
3. **Background Worker (Node.js Extension):** Uses the `archiver` stream library to handle zipping in a separate process, preventing the main UI thread from freezing.

## 🛠️ Installation

### 1. Prerequisites

Ensure you have the [Neutralino CLI](https://www.google.com/search?q=https://neutralino.js.org/docs/cli/setup) installed:

```bash
npm install -g @neutralinojs/neu

```

### 2. Setup

Clone the repository and install dependencies for both the frontend and the extension:

```bash
# Install root dependencies
npm install

# Install extension dependencies
cd extensions/zipper && npm install

# Install React dependencies
cd ../../react-src && npm install

```

## 🚀 Development

To start the application with Hot Module Replacement (HMR):

```bash
neu run

```

## 📦 Building for Production

To bundle the application for distribution:

```bash
neu build

```

The binaries for Windows, Mac, and Linux will be generated in the `dist/` folder.

## 📜 License

MIT
