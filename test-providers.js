// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

// Helper for nice terminal colors
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
};

function logHeader(text) {
  console.log(`\n${colors.bold}${colors.cyan}=== ${text} ===${colors.reset}\n`);
}

function logSuccess(text) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function logWarning(text) {
  console.log(`${colors.yellow}⚠ ${text}${colors.reset}`);
}

function logError(text) {
  console.log(`${colors.red}✗ ${text}${colors.reset}`);
}

function logInfo(text) {
  console.log(`${colors.dim}i ${text}${colors.reset}`);
}

// 1. Load env vars
function loadEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) {
    logWarning(
      `.env.local not found at ${envPath}. Trying to load from system environment variables.`,
    );
    return process.env;
  }

  logSuccess(`Loading environment variables from ${envPath}`);
  const content = fs.readFileSync(envPath, "utf8");
  const env = { ...process.env };

  content.split("\n").forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith("#")) return;

    const index = line.indexOf("=");
    if (index === -1) return;

    const key = line.slice(0, index).trim();
    let val = line.slice(index + 1).trim();

    // Remove wrapping quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    env[key] = val;
  });

  return env;
}

async function testProvider(name, prefix, env) {
  const apiKey = env[`${prefix}_API_KEY`];
  const baseUrl = env[`${prefix}_BASE_URL`];
  const model = env[`${prefix}_MODEL`];

  console.log(
    `\n${colors.bold}Testing Provider: ${name.toUpperCase()}${colors.reset}`,
  );
  console.log(
    `${colors.dim}----------------------------------------${colors.reset}`,
  );

  if (!apiKey || !baseUrl || !model) {
    logError(`Missing configuration for ${name}.`);
    if (!apiKey) console.log(`  - Missing: ${prefix}_API_KEY`);
    if (!baseUrl) console.log(`  - Missing: ${prefix}_BASE_URL`);
    if (!model) console.log(`  - Missing: ${prefix}_MODEL`);
    return;
  }

  console.log(`  Model:    ${colors.cyan}${model}${colors.reset}`);
  console.log(`  Base URL: ${colors.cyan}${baseUrl}${colors.reset}`);

  // Notice: The app client.ts calls: fetch(`${config.baseUrl}/chat/completions`)
  // Let's analyze the URL setup

  if (baseUrl.endsWith("/chat/completions")) {
    logWarning(
      `Base URL ends with '/chat/completions'. The app's client.ts calls \`\${baseUrl}/chat/completions\`, which will result in double-path: \`${baseUrl}/chat/completions/chat/completions\`.`,
    );
    logInfo(
      `We will test both the app-constructed URL AND the normalized URL.`,
    );
  }

  const testUrls = [];
  if (baseUrl.endsWith("/chat/completions")) {
    testUrls.push({
      type: "App-Constructed (Double Path / Potential Bug)",
      value: `${baseUrl}/chat/completions`,
    });
    testUrls.push({
      type: "Normalized (Correct URL / Single Path)",
      value: baseUrl,
    });
  } else {
    testUrls.push({
      type: "App-Constructed (Standard Path)",
      value: `${baseUrl}/chat/completions`,
    });
  }

  for (const target of testUrls) {
    console.log(
      `\n  Sending request to ${colors.bold}${target.type}${colors.reset}...`,
    );
    console.log(`  URL: ${colors.dim}${target.value}${colors.reset}`);

    const startTime = Date.now();
    try {
      const response = await fetch(target.value, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content:
                "Hello! Respond with a short greeting identifying yourself, in under 10 words.",
            },
          ],
          temperature: 0.7,
          max_tokens: 50,
        }),
      });

      const duration = Date.now() - startTime;
      console.log(
        `  Status:   ${response.ok ? colors.green : colors.red}${
          response.status
        } ${response.statusText}${colors.reset}`,
      );
      console.log(`  Latency:  ${colors.yellow}${duration}ms${colors.reset}`);

      const text = await response.text();
      if (response.ok) {
        try {
          const json = JSON.parse(text);
          const content =
            json.choices?.[0]?.message?.content ||
            "No content field found in response.";
          logSuccess(`Success response:`);
          console.log(`  ${colors.bold}"${content.trim()}"${colors.reset}`);
        } catch {
          logWarning(`Received non-JSON or malformed response:`);
          console.log(`  ${text}`);
        }
      } else {
        logError(`Request failed:`);
        console.log(`  ${colors.red}${text}${colors.reset}`);
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      logError(`Network error/Exception after ${duration}ms:`);
      console.log(`  ${colors.red}${err.message}${colors.reset}`);
    }
  }
}

async function main() {
  logHeader("AI PROVIDER TESTER");
  const env = loadEnv();

  await testProvider("OpenAgentic", "OPENAGENTIC", env);
  await testProvider("BluesMinds", "BLUESMINDS", env);

  logHeader("TEST COMPLETE");
}

main().catch((err) => {
  console.error("Fatal error running tests:", err);
});
