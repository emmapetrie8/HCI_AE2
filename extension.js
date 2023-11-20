const vscode = require('vscode');

function activate(context) {
    console.log('Congratulations, your extension "dashboard-stats" is now active!');

    let disposable = vscode.commands.registerCommand('dashboard-stats.launchDashboard', function () {
        
		// Create and show a new webview
        const panel = vscode.window.createWebviewPanel(
            'dashboardStats', // Identifies the type of the webview. Used internally
            'Dashboard Stats', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in
            {}
        );

        // Get the HTML content for the webview
        const webviewContent = getWebviewContent();

        // Set the HTML content in the webview
        panel.webview.html = webviewContent;
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard Stats</title>
            <style>  
			body {
				display: grid;
				grid-template-columns: repeat(3, 1fr); /* 3 columns with equal width */
				gap: 20px; /* Gap between grid items */
				padding: 20px;
			}

			.grid-item {
				border: 1px solid #ccc;
				padding: 10px;
				text-align: center;
			}

			.dashboard-title {
				width: 100%;
			}
            </style>
        </head>
        <body>
			<h1 class="dashboard-title">Dashboard stats plugin</h1>
			<div class="grid-item">Item 1</div>
			<div class="grid-item">Item 2</div>
			<div class="grid-item">Item 3</div>
			<div class="grid-item">Item 4</div>
			<div class="grid-item">Item 5</div>
			<div class="grid-item">Item 6</div>
        </body>
        </html>
    `;
}


module.exports = {
    activate,
    deactivate
};
