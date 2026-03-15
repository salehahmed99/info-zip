const fs = require("fs");
const process = require("process");
const WS = require("websocket").w3cwebsocket;
const { v4: uuidv4 } = require("uuid");

const path = require("path");
const archiver = require("archiver");

const processInput = JSON.parse(fs.readFileSync(process.stdin.fd, "utf-8"));
const NL_PORT = processInput.nlPort;
const NL_TOKEN = processInput.nlToken;
const NL_CTOKEN = processInput.nlConnectToken;
const NL_EXTID = processInput.nlExtensionId;

const client = new WS(
  `ws://localhost:${NL_PORT}?extensionId=${NL_EXTID}&connectToken=${NL_CTOKEN}`,
);
client.onerror = () => console.log("Connection error!");
client.onopen = () => console.log("Connected");
client.onclose = () => process.exit();

let currentArchive = null;
let currentTmpPath = null;

client.onmessage = async (message) => {
  const { event, data } = JSON.parse(message.data);

  if (event === "cancelZip") {
    if (currentArchive) {
      currentArchive.abort();
      currentArchive = null;
    }
    if (currentTmpPath && fs.existsSync(currentTmpPath)) {
      fs.unlinkSync(currentTmpPath);
    }
    currentTmpPath = null;
    return;
  }

  if (event === "zipFolder") {
    const folderPath = data.path;
    const fileCount = data.fileCount;
    const zipFileName = `${path.basename(folderPath)}.zip`;
    const parentDir = path.dirname(folderPath);
    const outputPath = path.join(parentDir, zipFileName);
    const tmpPath = outputPath + ".tmp";
    currentTmpPath = tmpPath;

    const output = fs.createWriteStream(tmpPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    currentArchive = archive;

    archive.on("progress", (progress) => {
      const percent = Math.round(
        (progress.entries.processed / fileCount) * 100,
      );
      client.send(
        JSON.stringify({
          id: uuidv4(),
          method: "app.broadcast",
          accessToken: NL_TOKEN,
          data: {
            event: "zipProgress",
            data: { percentage: percent > 100 ? 99 : percent },
          },
        }),
      );
    });

    output.on("close", () => {
      if (currentArchive) {
        fs.renameSync(tmpPath, outputPath);
        currentArchive = null;
        currentTmpPath = null;
        client.send(
          JSON.stringify({
            id: uuidv4(),
            method: "app.broadcast",
            accessToken: NL_TOKEN,
            data: {
              event: "zipComplete",
              data: { success: true, outputPath },
            },
          }),
        );
      }
    });

    archive.on("error", (err) => {
      currentArchive = null;
      currentTmpPath = null;
      client.send(
        JSON.stringify({
          id: uuidv4(),
          method: "app.broadcast",
          accessToken: NL_TOKEN,
          data: { event: "zipError", data: { message: err.message } },
        }),
      );
    });

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  }
};
