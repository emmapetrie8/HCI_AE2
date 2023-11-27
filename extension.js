const vscode = require('vscode');
const madge = require('madge');
const fs = require('fs');
const path = require('path');

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
                    .map(line => {
                        const errorIndex = line.indexOf('ERROR');
						if (errorIndex !== -1){
							const errorInfo = line.substring(errorIndex + 'ERROR'.length + 1).trim()
							const match = errorInfo.match(/\[(.*?):(\d+)\]:(.*)/);
                            if (match) {
                                const [, file, lineNum, message] = match;
                                return [message, file, lineNum];
                            }
						} else {
							return null, null, null 
						}
                    })
                    .filter(Boolean);

				if (errorLogs.length > 0){
					resolve(errorLogs);
				} else {
					data = 'No error logs found.'
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
        { enableScripts: true } // Webview options. enableScripts allows scripts to run in the webview
    );

    try {
        const errorLogs = await readAndDisplayErrorLogs();
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No folder or workspace opened');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const dependencyGraph = await madge(rootPath).then(res => res.obj());

        //vscode.window.showInformationMessage(JSON.stringify(dependencyGraph, null, 2));

        // Get the HTML content for the webview
        const webviewContent = getWebviewContent(errorLogs, getDataFromJson(),dependencyGraph);

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

function generateDependencyGraph(dependencyData) {
    const nodes = [];
    const edges = [];

    Object.keys(dependencyData).forEach(file => {
        nodes.push({ id: file, label: file });
        dependencyData[file].forEach(depFile => {
            edges.push({ from: file, to: depFile });
        });
    });

    return { nodes, edges };
}


function deactivate() {}

function getDataFromJson() {
    const jsonPath = path.join(__dirname, 'data.json'); // Adjust the path to your JSON file
    const rawData = fs.readFileSync(jsonPath);
    return JSON.parse(rawData);
}

function getWebviewContent(errorLogs, data, dependencyGraph) {
	const errorListHtml = errorLogs.map(log => {
        const [message, file, lineNum] = log;
        return `<li><span id="error-message">${message}</span> at ${file} on line ${lineNum} <button id="nav">nav</button></li>`;
    }).join('');

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

			#nav{
				background-color: #4CAF50; 
				height: 20px
				width: 20px
				color: white; 
				font-size: 10px; /* Font size */
				border: none; /* No border */
				border-radius: 5px; /* Rounded corners */
				cursor: pointer; /* Cursor style on hover */
			}

			#error-message{
				color: red;
			}
			

		</style>
		<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
		<script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
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
            <br>
            <button id="runTestsButton">Run All Tests</button>
        </div>
        <div class="grid-item">Error navigator
        <div class="error-logs">
        <h2>Error Logs</h2>
        <ul class="error-list">
                    ${errorListHtml}
                </ul>
        </div>
        
        </div>
        <div class="grid-item">Dependencies graph
		<div id="dependency-graph" style="height: 400px;"></div>
        </div>
        <div class="grid-item">Code smell detector
            <br>
            <div class="heatmap-container">
                <canvas id="radarChart"></canvas> <!-- Replace the heatmap div with this canvas element -->
            </div>
        </div>

        <script>
    document.addEventListener('DOMContentLoaded', function () {
        const networkData = ${JSON.stringify(dependencyGraph)};
        const container = document.getElementById('dependency-graph');
        const nodes = [];
        const edges = [];

        // Extract nodes and edges from networkData
        for (const [file, dependencies] of Object.entries(networkData)) {
            nodes.push({ id: file, label: file });
            for (const depFile of dependencies) {
                edges.push({ from: file, to: depFile });
            }
        }

        const graphData = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };

        const graphOptions = {};
        const network = new vis.Network(container, graphData, graphOptions);

        const runTestsButton = document.getElementById('runTestsButton');
        runTestsButton.addEventListener('click', () => {
            console.log('Running all tests...');
        });

        const ctx = document.getElementById('radarChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ${JSON.stringify(Object.keys(data.radarChart))},
                datasets: [{
                    label: 'My First Dataset',
                    data: ${JSON.stringify(Object.values(data.radarChart))},
                    fill: true,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            },
        });
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