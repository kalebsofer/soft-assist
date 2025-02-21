"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const AIPanel_1 = require("./panels/AIPanel");
function getStatusViewContent(extensionPath) {
    const htmlPath = path.join(extensionPath, 'out', 'webview', 'statusView.html');
    return fs.readFileSync(htmlPath, 'utf8');
}
function activate(context) {
    console.log('AI Assistant extension is now active!');
    const provider = vscode.window.registerWebviewViewProvider('ai-assistant-view', {
        resolveWebviewView: (webviewView) => {
            webviewView.webview.options = {
                enableScripts: true
            };
            webviewView.webview.html = getStatusViewContent(context.extensionUri.fsPath);
            webviewView.onDidChangeVisibility(() => {
                if (webviewView.visible && (!AIPanel_1.AIPanel.currentPanel || !AIPanel_1.AIPanel.currentPanel.isVisible())) {
                    AIPanel_1.AIPanel.createOrShow(context.extensionUri);
                    vscode.commands.executeCommand('workbench.action.focusSecondSideBar');
                }
            });
        }
    });
    let openAIPanelCommand = vscode.commands.registerCommand('soft-assist.openAIPanel', () => {
        AIPanel_1.AIPanel.createOrShow(context.extensionUri);
    });
    let askQuestionCommand = vscode.commands.registerCommand('soft-assist.askQuestion', async () => {
        const question = await vscode.window.showInputBox({
            prompt: 'What would you like to ask?',
            placeHolder: 'Enter your question...'
        });
        if (question) {
            const panel = await AIPanel_1.AIPanel.createOrShow(context.extensionUri);
            panel.sendMessage({
                type: 'response',
                content: question
            });
        }
    });
    // When the extension activates, open the AI Panel in the secondary sidebar
    AIPanel_1.AIPanel.createOrShow(context.extensionUri);
    vscode.commands.executeCommand('workbench.action.focusSecondSideBar');
    context.subscriptions.push(provider, openAIPanelCommand, askQuestionCommand);
}
function deactivate() { }
