<?php
/**
 * Alcolic Backend Server Status Checker for Hostinger Shared Hosting
 * This script checks if the Node.js server is running
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

coloredOutput("🔍 Checking Alcolic Backend Server Status...", 'blue');

// Check if PID file exists
if (!file_exists($pidFile)) {
    coloredOutput("❌ Server is not running (no PID file found)", 'red');
    exit(1);
}

$pid = file_get_contents($pidFile);

if (!is_numeric($pid)) {
    coloredOutput("❌ Invalid PID in PID file", 'red');
    exit(1);
}

// Check if process is running
if (posix_kill($pid, 0)) {
    coloredOutput("✅ Server is running with PID: $pid", 'green');
    
    // Get process info
    $processInfo = shell_exec("ps -p $pid -o pid,ppid,cmd,etime --no-headers 2>/dev/null");
    if ($processInfo) {
        coloredOutput("📊 Process Info:", 'blue');
        echo trim($processInfo) . "\n";
    }
    
    // Check log file
    if (file_exists($logFile)) {
        $logSize = filesize($logFile);
        coloredOutput("📝 Log file size: " . number_format($logSize) . " bytes", 'blue');
        
        // Show last few lines of log
        $lastLines = shell_exec("tail -5 $logFile 2>/dev/null");
        if ($lastLines) {
            coloredOutput("📋 Recent log entries:", 'blue');
            echo $lastLines;
        }
    }
    
    coloredOutput("🌐 API should be available at: https://api.alcolic.gnritservices.com", 'green');
    
} else {
    coloredOutput("❌ Server is not running (PID $pid not found)", 'red');
    unlink($pidFile);
    exit(1);
}
?>
