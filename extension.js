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
				grid-template-columns: repeat(2, 1fr); /* 3 columns with equal width */
				gap: 20px; /* Gap between grid items */
				padding: 20px;
			}

			.grid-item {
				border: 1px solid #ccc;
				padding: 10px;
				text-align: center;
				width: 90%;
				height: 200px;
			}

			.dashboard-title {
				width: 100%;
				margin-bottom: 20px;
			}

			.heatmap-container {
				height: 80%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;
			}
	
			.heatmap {
				width: 100%;
				height: 100%;
				background: linear-gradient(to bottom, #ffcccc 0%, #ff6666 40%, #ff0000 80%);
			}

			.pie-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 80%;
				justify-content: flex-end;
			}

			.pie {
				width: 100px;
				height: 100px;
				background-image: conic-gradient(#96577f 40%, #73d9cf 40%, #73d9cf 100%);
				border-radius: 50%;
			}

			.label {
				color: white;
				font-size: 15px;
				margin-top: 5px; 
			}

		</style>
	</head>
	<body>
		<h1 class="dashboard-title">Dashboard stats plugin</h1>
		<br>
		<div class="grid-item">
			Test coverage visualisation
			<br>
			<div class="pie-container">
				<div class="pie"></div>
				<div class="label">Untested code 40%</div>
				<div class="label">Tested code 60%</div>
			</div>
		</div>
		<div class="grid-item">Error navigator</div>
		<div class="grid-item">Dependencies graph</div>
		<div class="grid-item">Code smell detector
			<br>
			<div class="heatmap-container">
				<div class="heatmap"></div>
				<div class="label">Untested code 40%</div>
				<div class="label">Tested code 60%</div>
			</div>
		</div>
		<div class="grid-item">To-do list</div>
		<div class="grid-item">Customisation</div>
	</body>
    </html>
    `;
}


module.exports = {
    activate,
    deactivate
};
