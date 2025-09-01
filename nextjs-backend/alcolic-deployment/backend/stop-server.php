<?php
/**
 * Alcolic Backend Server Stopper for Hostinger Shared Hosting
 * This script stops the Node.js server
 */

$pidFile = 'server.pid';
$logFile = 'server.log';

// Colors for output
$colors = [
    'red' => "\033[0;31m",
    'green' => "\033[0;32m",
    'yellow' => "\033[1;33m",
    'blue' => "\033[0;34m",
    'nc' => "\033[0m"
];

function coloredOutput($message, $color = 'nc') {
    global $colors;
    echo $colors[$color] . $message . $colors['nc'] . "\n";
}

// Check if PID file exists
if (!file_exists($pidFile)) {
    coloredOutput("❌ Server PID file not found. Server may not be running.", 'red');
    exit(1);
}

$pid = file_get_contents($pidFile);

if (!is_numeric($pid)) {
    coloredOutput("❌ Invalid PID in PID file.", 'red');
    unlink($pidFile);
    exit(1);
}

// Check if process is running
if (!posix_kill($pid, 0)) {
    coloredOutput("❌ Server process (PID: $pid) is not running.", 'red');
    unlink($pidFile);
    exit(1);
}

// Stop the server
coloredOutput("🛑 Stopping Alcolic Backend Server (PID: $pid)...", 'yellow');

// Send SIGTERM first
posix_kill($pid, SIGTERM);

// Wait a moment
sleep(2);

// Check if process is still running
if (posix_kill($pid, 0)) {
    coloredOutput("⚠️  Server didn't stop gracefully. Force killing...", 'yellow');
    posix_kill($pid, SIGKILL);
    sleep(1);
}

// Final check
if (posix_kill($pid, 0)) {
    coloredOutput("❌ Failed to stop server process.", 'red');
    exit(1);
} else {
    coloredOutput("✅ Server stopped successfully.", 'green');
    unlink($pidFile);
}
?>
