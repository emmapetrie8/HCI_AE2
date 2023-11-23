const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const logOutputChannel = vscode.window.createOutputChannel('Log Viewer');

function readAndDisplayErrorLogs() {
    return new Promise((resolve, reject) => {
        const logFilePath = path.join(__dirname, 'sample.log');

        // Read the log file
        fs.readFile(logFilePath, 'utf-8', (err, data) => {
            if (err) {
                vscode.window.showErrorMessage(`Error reading log file: ${err.message}`);
                reject(err);
            } else {
                // Filter logs for errors
                const errorLogs = data
                    .split('\n')
                    .filter(line => line.includes('ERROR'));

                // Display error logs in the output channel
                if (errorLogs.length > 0) {
                    logOutputChannel.clear();
                    logOutputChannel.appendLine('Error Logs:');
                    logOutputChannel.append(errorLogs.join('\n'));
                    logOutputChannel.show(true);
                    resolve(errorLogs);
                } else {
                    vscode.window.showInformationMessage('No error logs found.');
                    resolve([]);
                }
            }
        });
    });
}


async function launchDashboard() {
    // Create and show a new webview
    const panel = vscode.window.createWebviewPanel(
        'dashboardStats', // Identifies the type of the webview. Used internally
        'Dashboard Stats', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {}
    );

    try {
        const errorLogs = await readAndDisplayErrorLogs();

        // Get the HTML content for the webview
        const webviewContent = getWebviewContent(errorLogs);

        // Set the HTML content in the webview
        panel.webview.html = webviewContent;
    } catch (error) {
        // Handle the error as needed
        console.error(error);
    }
}

function activate(context) {
    console.log('Congratulations, your extension "dashboard-stats" is now active!');
    let disposable = vscode.commands.registerCommand('dashboard-stats.launchDashboard', launchDashboard);
}

function deactivate() {}

function getWebviewContent(errorLogs) {
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
				height: 250px;
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
				background: linear-gradient(to bottom, #eda807 20%, #ed8907 40%, #ed6b07 40%);
			}

			.pie-container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				height: 70%;
				justify-content: flex-end;
			}

			.pie {
				width: 100px;
				height: 100px;
				background-image: conic-gradient(#96577f ${data.testCoverage.untestedCode}%, #73d9cf 40%, #73d9cf 100%);
				border-radius: 50%;
			}

			.label {
				color: white;
				font-size: 15px;
				margin-top: 5px; 
			}

			#runTestsButton {
				background-color: #4CAF50; 
				color: white; 
				padding: 10px 20px; 
				font-size: 10px; /* Font size */
				border: none; /* No border */
				border-radius: 5px; /* Rounded corners */
				cursor: pointer; /* Cursor style on hover */
			}
		
			#runTestsButton:hover {
				background-color: #45a049; /* Darker green on hover */
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
				<div class="label">Untested code ${data.testCoverage.untestedCode}%</div>
				<div class="label">Tested code ${data.testCoverage.testedCode}%</div>
			</div>
		</div>
		<div class="grid-item">Error navigator
		<div class="error-logs">
		<h2>Error Logs</h2>
		<ul>
			${errorLogs.map(log => `<li>${log}</li>`).join('')}
		</ul>
		</div>
		
		</div>
		<div class="grid-item">Dependencies graph</div>
		<div class="grid-item">Code smell detector
			<br>
			<div class="heatmap-container">
				<div class="heatmap"></div>
				<div class="label">Labels</div>
				<div class="label">Labels</div>
			</div>
		</div>
		<div class="grid-item">To-do list</div>
		<div class="grid-item">Customisation</div>
		<script>
			const runTestsButton = document.getElementById('runTestsButton');
			runTestsButton.addEventListener('click', () => {
				console.log('Running all tests...');
			});
		</script>
	</body>
    </html>
    `;
}

function updateWebviewContent(errorLogs) {
    // Find and update the existing webview if it's already created
    const existingWebview = vscode.window.visibleTextEditors.find(editor =>
        editor.document.uri.scheme === 'dashboard-stats'
    );

    if (existingWebview) {
        existingWebview.webview.html = getWebviewContent(errorLogs);
    }
}


module.exports = {
    activate,
    deactivate
};