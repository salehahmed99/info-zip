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

## 🎨 ScreenShots - UI :

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

## 🚀 Getting Started

```bash
# 1. Install Neutralinojs CLI
npm install -g @neutralinojs/neu

# 2. Install extension dependencies
cd extensions/zipper && npm install

# 3. Install React dependencies
cd ../../react-src && npm install

# 4. Run the application
cd ../..
neu run

```

## 📝 License

MIT License
