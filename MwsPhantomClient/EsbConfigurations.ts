/// <reference path="./scripts/Actions.ts"/>
/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="configtypebase.ts" />
module ConfigTypes {
    export class EsbConfigurations extends ConfigTypeBase{
        actions: Actions;
        page: WebPage;
        requiredParameters: { addServer: string[]};
        screenDumpRepository: string;
        addServerPath: string;

        constructor(phantom: Phantom, screenDumpRepository: string) {
            super();
            this.page = require('webpage').create();
            this.phantom = phantom;
            this.screenDumpRepository = screenDumpRepository;
            this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
            this.addServerPath = 'webm.apps.tasks.admin.esbadmin';
            
        }       

        public exitOnTimeout = (step: Step) => {
                step.page.close();
                step.phantom.exit(2);
            }

        login(config: any) {
                console.log(JSON.stringify(config));
                document.querySelector("#wm_login-username").setAttribute('value', config.loginUserName);
                var passwordInputBox: any = document.querySelector("#wm_login-password");
                passwordInputBox.value = config.loginPassword;
                var loginForm: any = document.forms['Login'];
                loginForm.submit();
            }

        enterDescriptionInput(config: any) {
            var addServerDialog = document.querySelector("div[id*='editDlg'][id*='content']");
            var descriptionInput: any = addServerDialog.querySelector("input[id$='editDescr']");
            descriptionInput.value = config.description;
        }

        enterServerHostInput(config: any) {
            var addServerDialog = document.querySelector("div[id*='editDlg'][id*='content']");
            var serverInput: any = addServerDialog.querySelector("input[id$='editHost']");
            serverInput.value = config.serverHost;
        }

        enterServerPortInput(config: any) {
            var addServerDialog = document.querySelector("div[id*='editDlg'][id*='content']");
            var serverPortInput: any = addServerDialog.querySelector("input[id$='editPort']");
            serverPortInput.value = config.serverPort;
        }

        hasAddServerButton() {
            var filterButtons = (buttons: any, innerText: string) => {
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.trim() == innerText.trim()) { return buttons[i]; }
                } return null;
            }
        var defaultForm = document.querySelector("form[name$='defaultForm']");
            if (defaultForm == null) { return false; }
            var allButtons: any = defaultForm.querySelectorAll("button");
            if (allButtons == null) { return false; }
            return (filterButtons(allButtons, 'Add Server...') != null);
        }

        clickAddServer(config: any) {
            var filterButtons = (buttons: any, innerText: string) => {
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.trim() == innerText.trim()) { return buttons[i]; }
                } return null;
            }
        var defaultForm = document.querySelector("form[name$='defaultForm']");
            var allButtons: any = defaultForm.querySelectorAll("button");
            var addServerButton: any = filterButtons(allButtons, 'Add Server...');
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            addServerButton.dispatchEvent(ev);
        }

        clickOkAddServer(config: any) {
            var filterButtons = (buttons: any, innerText: string) => {
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.trim() == innerText.trim()) { return buttons[i]; }
                } return null;
            }
        var addServerDialog = document.querySelector("div[id*='editDlg'][id*='content']");
            var allButtons: any = addServerDialog.querySelectorAll("button");

            var okButton = filterButtons(allButtons, 'OK');
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            okButton.dispatchEvent(ev);
        }

        noop(config: any) {
            console.log('noop');
        }

        noPrerequisite(config: any) {
            return true;
        }

        end = (step: Step) => {
            console.log('end in 5 seconds');
            var page = step.page;
            var phantom = step.phantom;
            setTimeout(function () {
                page.close();
                phantom.exit(0);
            }, 5000);
        }

        public addServerSetup(config: any) {
                // verify config
                var missingConfig = [];
                var phantom = this.phantom;
                var exitOnTimeout = this.exitOnTimeout;
                var addServerPath = this.addServerPath;
                var noPrerequisite = this.noPrerequisite;
                var requiredParameterList = this.requiredParameters['addServer'];
                this.actions
                    .withConfig(config, requiredParameterList)
                    .open(config.url, 'open main page')
                    .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                    .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                    .open(config.url + '/' + addServerPath, 'open addServerPath page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                    .then(this.clickAddServer, 'clickAddServer', this.hasAddServerButton, this.exitOnTimeout, 1000, 15000)
                    .then(this.noop, 'sleep2secondsAfterAddServer', (config: any) => { return false; }, this.noop, 2000, 2000)
                    .then(this.enterServerHostInput, 'enterServerHostInput', () => { return document.querySelector("div[id*='editDlg'][id*='content'] input[id$='editHost']") != null; }, this.exitOnTimeout, 500, 10000)
                    .then(this.enterServerPortInput, 'enterServerPortInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                    .then(this.enterDescriptionInput, 'enterDescriptionInput', () => { return document.querySelector("div[id*='editDlg'][id*='content'] input[id$='editDescr']") != null; }, this.exitOnTimeout, 1000, 10000)
                    .then(this.noop, 'sleep 1secondsAfterEsbServerEntry', (config: any) => { return false; }, this.noop, 1000, 1000)
                    .then(this.clickOkAddServer, 'clickOkAddServer', noPrerequisite, this.exitOnTimeout, 500, 10000)
                    .end(this.end);
            }


        public configure() {
                this.actions.run();
            }

    }

    EsbConfigurations.prototype.requiredParameters = {
        addServer: ['loginUserName', 'loginPassword', 'url', 'description', 'serverHost', 'serverPort']
    }

}