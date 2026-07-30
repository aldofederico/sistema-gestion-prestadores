import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const npxCommand = isWindows ? "npx.cmd" : "npx";
const composeArguments = [
  "compose",
  "-f",
  "compose.yaml",
  "-f",
  "compose.test.yaml"
];
const databaseUrl =
  "postgresql://providers_user:providers_local_password@localhost:5433/providers_test?schema=public";

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
    ...options
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `El comando ${command} ${args.join(" ")} finalizó con código ${result.status}.`
    );
  }

  return result;
};

const capture = (command, args) => {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8"
  });
  if (result.error) throw result.error;
  return result;
};

let infrastructureStarted = false;
let exitCode = 1;

try {
  run("docker", [...composeArguments, "up", "-d", "db"]);
  infrastructureStarted = true;

  let databaseHealthy = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const readiness = capture("docker", [
      ...composeArguments,
      "exec",
      "-T",
      "db",
      "pg_isready",
      "-U",
      "providers_user",
      "-d",
      "providers"
    ]);

    if (readiness.status === 0) {
      databaseHealthy = true;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!databaseHealthy) {
    throw new Error("PostgreSQL no alcanzó estado saludable para las pruebas.");
  }

  const databaseExists = capture("docker", [
    ...composeArguments,
    "exec",
    "-T",
    "db",
    "psql",
    "-U",
    "providers_user",
    "-d",
    "postgres",
    "-tAc",
    "SELECT 1 FROM pg_database WHERE datname = 'providers_test'"
  ]);

  if (databaseExists.status !== 0) throw new Error(databaseExists.stderr);

  if (databaseExists.stdout.trim() !== "1") {
    run("docker", [
      ...composeArguments,
      "exec",
      "-T",
      "db",
      "createdb",
      "-U",
      "providers_user",
      "providers_test"
    ]);
  }

  const testEnvironment = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    NODE_ENV: "test"
  };

  run(npmCommand, ["run", "db:migrate:deploy"], {
    env: testEnvironment,
    shell: isWindows
  });

  const testResult = spawnSync(npxCommand, ["vitest", "run"], {
    cwd: process.cwd(),
    env: testEnvironment,
    shell: isWindows,
    stdio: "inherit"
  });
  if (testResult.error) throw testResult.error;
  exitCode = testResult.status ?? 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  if (infrastructureStarted) {
    const teardown = spawnSync("docker", [...composeArguments, "down"], {
      cwd: process.cwd(),
      stdio: "inherit"
    });
    if (teardown.status !== 0 && exitCode === 0) {
      exitCode = teardown.status ?? 1;
    }
  }
}

process.exit(exitCode);