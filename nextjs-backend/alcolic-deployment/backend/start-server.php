<?php
/**
 * Alcolic Backend Server Starter for Hostinger Shared Hosting
 * This script starts the Node.js server using Hostinger's Node.js support
 */

// Configuration
$nodeVersion = '18'; // Use Node.js 18
$serverScript = '.next/standalone/server.js';
$port = 3000;
$logFile = 'server.log';
$pidFile = 'server.pid';

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

// Check if server is already running
if (file_exists($pidFile)) {
    $pid = file_get_contents($pidFile);
    if (is_numeric($pid) && posix_kill($pid, 0)) {
        coloredOutput("✅ Server is already running with PID: $pid", 'green');
        exit(0);
    } else {
        unlink($pidFile);
    }
}

// Check if Node.js is available
$nodePath = "/opt/alt/alt-nodejs$nodeVersion/root/usr/bin/node";
if (!file_exists($nodePath)) {
    coloredOutput("❌ Node.js $nodeVersion not found at: $nodePath", 'red');
    coloredOutput("🔧 Trying alternative Node.js paths...", 'yellow');
    
    // Try alternative paths
    $alternativePaths = [
        "/opt/alt/alt-nodejs18/root/usr/bin/node",
        "/opt/alt/alt-nodejs16/root/usr/bin/node",
        "/opt/alt/alt-nodejs14/root/usr/bin/node",
        "/usr/bin/node",
        "/usr/local/bin/node"
    ];
    
    foreach ($alternativePaths as $path) {
        if (file_exists($path)) {
            $nodePath = $path;
            coloredOutput("✅ Found Node.js at: $nodePath", 'green');
            break;
        }
    }
    
    if (!file_exists($nodePath)) {
        coloredOutput("❌ Node.js not found. Please contact Hostinger support to enable Node.js.", 'red');
        exit(1);
    }
}

// Check if server script exists
if (!file_exists($serverScript)) {
    coloredOutput("❌ Server script not found: $serverScript", 'red');
    coloredOutput("🔧 Please run 'npm run build' first", 'yellow');
    exit(1);
}

// Set environment variables
putenv("NODE_ENV=production");
putenv("PORT=$port");

// Start the server
coloredOutput("🚀 Starting Alcolic Backend Server...", 'blue');
coloredOutput("📡 Using Node.js: $nodePath", 'blue');
coloredOutput("🌐 Port: $port", 'blue');
coloredOutput("📝 Log file: $logFile", 'blue');

// Build the command
$command = sprintf(
    '%s %s > %s 2>&1 & echo $! > %s',
    escapeshellarg($nodePath),
    escapeshellarg($serverScript),
    escapeshellarg($logFile),
    escapeshellarg($pidFile)
);

// Execute the command
exec($command, $output, $returnCode);

if ($returnCode === 0) {
    $pid = file_get_contents($pidFile);
    coloredOutput("✅ Server started successfully with PID: $pid", 'green');
    coloredOutput("🌐 API will be available at: https://api.alcolic.gnritservices.com", 'blue');
    coloredOutput("📝 Check logs with: tail -f $logFile", 'yellow');
    coloredOutput("🛑 Stop server with: kill $pid", 'yellow');
} else {
    coloredOutput("❌ Failed to start server", 'red');
    coloredOutput("📝 Check error logs: $logFile", 'yellow');
    exit(1);
}
?>
