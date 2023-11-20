// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// const vscode = require('vscode');

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed

// /**
//  * @param {vscode.ExtensionContext} context
//  */
// function activate(context) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "dashboard-stats" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with  registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('dashboard-stats.launchDashboard', function () {
// 		// The code you place here will be executed every time your command is executed

// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from Dashboard stats!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// function deactivate() {}

// module.exports = {
// 	activate,
// 	deactivate
// }

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
			Hello from the dashboard
        </head>
        <body>

        </body>
        </html>
    `;
}

module.exports = {
    activate,
    deactivate
};
