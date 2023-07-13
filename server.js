const express = require("express");
const request = require("request");
const fs = require("fs");
const app = express();

const chromeURLs = {
	mac: "https://dl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg",
	windows: "http://dl.google.com/chrome/install/375.126/chrome_installer.exe",
	linux:
		"https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
};

app.get("/macos", (req, res) => {
	const filePath = "./chrome/googlechrome.dmg";
	console.log(filePath);
	downloadFile(chromeURLs.mac, filePath, res);
});

app.get("/windows", (req, res) => {
	const filePath = "./chrome/ChromeSetup.exe";
	downloadFile(chromeURLs.windows, filePath, res);
});

app.get("/linux", (req, res) => {
	const filePath = "./chrome/google-chrome-stable_current_amd64.deb";
	downloadFile(chromeURLs.linux, filePath, res);
});

app.get("/install.sh", (req, res) => {
	const platform = getPlatform(req.headers["user-agent"]);
	const script = generateInstallScript(platform);
	res.set("Content-Type", "text/plain");
	res.send(script);
});

function downloadFile(url, filePath, res) {
	if (fs.existsSync(filePath)) {
		// File already exists, serve it from the cache
		res.download(filePath);
	} else {
		// File doesn't exist, download and save it
		const fileStream = fs.createWriteStream(filePath);
		request(url).pipe(fileStream);
		fileStream.on("finish", () => {
			res.download(filePath);
		});
	}
}

function getPlatform(userAgent) {
	if (/Mac/i.test(userAgent)) {
		return "mac";
	} else if (/Windows/i.test(userAgent)) {
		return "windows";
	} else if (/Linux/i.test(userAgent)) {
		return "linux";
	}
	return null;
}

function generateInstallScript(platform) {
	if (platform === "mac") {
		return `#!/bin/bash\n
            curl -o chrome.dmg ${chromeURLs.mac}\n
            # Add your installation logic for macOS here\n`;
	} else if (platform === "windows") {
		return `#!/bin/bash\n
            curl -o ChromeSetup.exe ${chromeURLs.windows}\n
            # Add your installation logic for Windows here\n`;
	} else if (platform === "linux") {
		return `#!/bin/bash\n
            curl -o google-chrome-stable_current_amd64.deb ${chromeURLs.linux}\n
            # Add your installation logic for Linux here\n`;
	}
	return "";
}

app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});
