<?php

declare(strict_types=1);

set_time_limit(0);
ini_set('memory_limit', '512M');
ini_set('output_buffering', '0');
ini_set('zlib.output_compression', '0');

$baseDir = __DIR__;

$lock = fopen(sys_get_temp_dir().DIRECTORY_SEPARATOR.'mahala-web-'.sha1($baseDir).'.lock', 'c');
if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
    http_response_code(409);
    exit("Another redeploy is already running.\n");
}
chdir($baseDir);

if (PHP_SAPI !== 'cli') {
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-cache');
    header('X-Accel-Buffering: no');
}

while (ob_get_level() > 0) {
    ob_end_flush();
}
ob_implicit_flush(true);

$startedAt = time();
$write = static function (string $message): void {
    echo $message;
    flush();
};
$shellArg = static fn (string $value): string => escapeshellarg($value);

$findExecutable = static function (array $commands): ?string {
    foreach ($commands as $command) {
        if (str_contains($command, DIRECTORY_SEPARATOR) && is_file($command) && is_executable($command)) {
            return $command;
        }

        $check = PHP_OS_FAMILY === 'Windows'
            ? 'where '.escapeshellarg($command)
            : 'command -v '.escapeshellarg($command);
        $output = [];
        exec($check, $output, $exitCode);
        if ($exitCode === 0 && isset($output[0]) && $output[0] !== '') {
            return trim($output[0]);
        }
    }

    return null;
};

$runCommand = static function (string $command, string $cwd, callable $write): int {
    $process = proc_open($command, [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ], $pipes, $cwd);

    if (! is_resource($process)) {
        $write("Failed to start command: {$command}\n");

        return 1;
    }

    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);
    $lastOutputAt = time();
    $exitCode = null;

    do {
        foreach ([1, 2] as $pipeNumber) {
            while (($line = fgets($pipes[$pipeNumber])) !== false) {
                $lastOutputAt = time();
                $write($line);
            }
        }

        $status = proc_get_status($process);
        if (! $status['running']) {
            $exitCode = $status['exitcode'];
            break;
        }

        if (time() - $lastOutputAt >= 15) {
            $lastOutputAt = time();
            $write('... still running at '.date('H:i:s')."\n");
        }
        usleep(100000);
    } while (true);

    foreach ([1, 2] as $pipeNumber) {
        while (($line = fgets($pipes[$pipeNumber])) !== false) {
            $write($line);
        }
        fclose($pipes[$pipeNumber]);
    }

    $closeCode = proc_close($process);

    return is_int($exitCode) && $exitCode >= 0 ? $exitCode : $closeCode;
};

$homeDir = getenv('HOME') ?: (getenv('DOCUMENT_ROOT') ? dirname(getenv('DOCUMENT_ROOT')) : '');
$npmCandidates = array_filter([
    'npm',
    '/usr/local/bin/npm',
    '/usr/bin/npm',
    $homeDir ? $homeDir.'/bin/npm' : null,
    $homeDir ? $homeDir.'/.nvm/current/bin/npm' : null,
    '/opt/cpanel/ea-nodejs22/bin/npm',
    '/opt/cpanel/ea-nodejs20/bin/npm',
    '/opt/cpanel/ea-nodejs18/bin/npm',
    '/opt/alt/alt-nodejs22/root/usr/bin/npm',
    '/opt/alt/alt-nodejs20/root/usr/bin/npm',
    '/opt/alt/alt-nodejs18/root/usr/bin/npm',
]);

$npm = $findExecutable($npmCandidates);

if ($npm === null) {
    $nodeCandidates = array_filter([
        'node',
        '/usr/local/bin/node',
        '/usr/bin/node',
        $homeDir ? $homeDir.'/bin/node' : null,
        $homeDir ? $homeDir.'/.nvm/current/bin/node' : null,
        '/opt/cpanel/ea-nodejs22/bin/node',
        '/opt/cpanel/ea-nodejs20/bin/node',
        '/opt/cpanel/ea-nodejs18/bin/node',
        '/opt/alt/alt-nodejs22/root/usr/bin/node',
        '/opt/alt/alt-nodejs20/root/usr/bin/node',
        '/opt/alt/alt-nodejs18/root/usr/bin/node',
    ]);
    $node = $findExecutable($nodeCandidates);
    if ($node !== null) {
        $nodeDir = dirname($node);
        $npmCandidate = $nodeDir.DIRECTORY_SEPARATOR.'npm';
        if (is_file($npmCandidate)) {
            $npm = $npmCandidate;
        }
    }
}

if ($npm === null) {
    $write("Could not find npm. Searched:\n");
    foreach ($npmCandidates as $candidate) {
        $write("  - {$candidate}\n");
    }
    $write("Set up Node.js on the server or add its path to the redeploy script.\n");
    exit(127);
}

$nodeDir = dirname(is_link($npm) ? readlink($npm) ?: $npm : $npm);
$currentPath = getenv('PATH') ?: '';
if ($nodeDir !== '' && strpos($currentPath, $nodeDir) === false) {
    putenv('PATH='.$nodeDir.':'.$currentPath);
    $write("Added {$nodeDir} to PATH.\n");
}

$npmCommand = $shellArg($npm);

$commands = [
    ['label' => 'Pulling latest code', 'command' => 'git pull --ff-only'],
    ['label' => 'Installing npm dependencies', 'command' => $npmCommand.' ci --no-audit --no-fund'],
    ['label' => 'Building production bundle', 'command' => $npmCommand.' run build'],
];

foreach ($commands as $step) {
    $write("\n=== {$step['label']} ===\n");
    $write("Command: {$step['command']}\n");
    $exitCode = $runCommand($step['command'], $baseDir, $write);
    if ($exitCode !== 0) {
        $write("{$step['label']} failed with exit code {$exitCode}.\n");
        exit($exitCode);
    }
}

$write("\nRedeploy completed successfully in ".(time() - $startedAt)."s.\n");
