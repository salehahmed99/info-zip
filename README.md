# 📦 Neu-Pack - Neutralinojs Project Bundler

A high-performance, **TypeScript-powered** desktop utility built with **Neutralinojs**, **Vite**, and **React**. Neu-Pack demonstrates advanced framework architecture by offloading heavy I/O tasks to a **Node.js Extension** while maintaining a fluid, animated UI.

## ✨ Features

- **Deep Scan Engine** - Recursively analyzes directory structures to calculate total file counts and project size.
- **Real-time Progress** - Bi-directional communication provides live percentage updates during zipping.
- **Atomic Write Strategy** - Uses `.tmp` file streaming to ensure zip archives are never corrupted if a process is interrupted.
- **Native OS Integration** - Seamlessly triggers native folder selection dialogs via the OS API.
- **Process Control** - Ability to abort active zipping operations and clean up temporary artifacts.
- **Developer UI** - A sleek "Carbon" dark-mode aesthetic with smooth Framer Motion transitions and spring physics.
- **Three-Tier Architecture** - Clean separation between UI (React), Bridge (Neutralino), and Worker (Node.js).

## ✔️ ScreenShots - UI :

<img src="https://github.com/salehahmed99/neu-pack/blob/main/readme-assets/1.png"  alt="1" />
<img src="https://github.com/salehahmed99/neu-pack/blob/main/readme-assets/2.png"  alt="2" />
<img src="https://github.com/salehahmed99/neu-pack/blob/main/readme-assets/3.png"  alt="3" />
<img src="https://github.com/salehahmed99/neu-pack/blob/main/readme-assets/4.png"  alt="4" />

## 🧠 How It's Built Using Neutralinojs APIs

### 1. Filesystem API (`Neutralino.filesystem`)

Used for recursive directory traversal and file metadata retrieval:

```typescript
// Get metadata for a specific path
const stats = await filesystem.getStats(entry.path);

// Read directory contents
const entries = await filesystem.readDirectory(folderPath);
```

### 2. OS API (`Neutralino.os`)

Handles the native "Select Folder" interaction:

```typescript
// Open native OS folder picker
const folderPath = await os.showFolderDialog("Select a project folder");
```

### 3. Extensions API (`Neutralino.extensions`)

The core "Flex" of the app — offloading zipping to a background Node.js process:

```typescript
// Dispatching the task to the Node.js extension
await extensions.dispatch("js.neutralino.zipper", "zipFolder", {
  path: folderData.path,
  fileCount: folderData.fileCount,
});
```

### 4. Events API (`Neutralino.events`)

Handles real-time communication between the Node.js Extension and the React UI:

```typescript
// Listen for progress updates broadcasted by the extension
events.on("zipProgress", (event) => {
  setZipProgress(event.detail.percentage);
});
```

## 🏗️ Project Structure

```text
neu-pack/
├── extensions/
│   └── zipper/
│       ├── main.js         # Node.js Background Worker
│       └── package.json    # Extension dependencies (archiver, ws)
├── react-src/
│   ├── src/
│   │   ├── App.tsx         # Main UI & Logic
│   │   └── main.tsx        # React Entry point
│   ├── vite.config.ts      # Vite HMR Configuration
│   └── tailwind.config.cjs # Styling Configuration
├── bin/                    # Neutralino native binaries
├── neutralino.config.json  # App & Extension permissions
└── README.md

```

## 🚀 Getting Started

### Prerequisites

- [Neutralinojs CLI](https://www.google.com/search?q=https://neutralino.js.org/docs/cli/setup) (`npm install -g @neutralinojs/neu`)

### Installation & Running

```bash
# 1. Install extension dependencies
cd extensions/zipper && npm install

# 2. Install React dependencies
cd ../../react-src && npm install

# 3. Run the application
cd ../..
neu run

```

## 📊 Neutralinojs APIs Configuration

The app requires the following permissions in `neutralino.config.json`:

```json
"nativeAllowList": ["app.*", "extensions.*", "filesystem.*", "events.*", "os.*", "window.*"]

```

## 📝 License

MIT License - Built with ❤️ for **GSoC 2026**.
