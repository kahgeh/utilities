/// <reference path="./scripts/Actions.ts"/>
/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="configtypebase.ts" />
module ConfigTypes {
    export class SystemSettings extends ConfigTypeBase{
        actions: Actions;
        page: WebPage;
        phantom: Phantom;
        screenDumpRepository: string;
        addServerPath: string;
        requiredParameters: { addServer: string[] };

        constructor(phantom: Phantom, screenDumpRepository: string) {
            super();
            this.page = require('webpage').create();
            this.page.viewportSize = { width: 800, height: 640 };
            this.phantom = phantom;
            this.screenDumpRepository = screenDumpRepository;
            this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
            this.addServerPath = 'webm.apps.config.ws.locations';

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

        enterNameInput(config: any) {
            var lastNewRow: any = document.querySelector("table[id$='serversTable'] tbody tr[id*='new']");
            var nameInput = lastNewRow.querySelector("input[id$='nameInput']");
            nameInput.value = config.name;
        }

        enterIntegrationServerOrMonitorHostInput(config: any) {
            var lastNewRow: any = document.querySelector("table[id$='serversTable'] tbody tr[id*='new']");
            var integrationServerOrMonitorHostInput = lastNewRow.querySelector("input[id$='isHostInput']");
            integrationServerOrMonitorHostInput.value = config.integrationServerOrMonitorHost;
        }

        enterPortInput(config: any) {
            var lastNewRow: any = document.querySelector("table[id$='serversTable'] tbody tr[id*='new']");
            var portInput: any = lastNewRow.querySelector("input[id$='isPortInput']");
            portInput.value = config.port;
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
            return filterButtons(allButtons, 'Add Server') != null;

        }
        clickAddServer(config: any) {
            var filterButtons = (buttons: any, innerText: string) => {
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.trim() == innerText.trim()) { return buttons[i]; }
                } return null;
            }
        var defaultForm = document.querySelector("form[name$='defaultForm']");
            var allButtons: any = defaultForm.querySelectorAll("button");
            var addServerButton: any = filterButtons(allButtons, 'Add Server');
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            addServerButton.dispatchEvent(ev);
        }

        clickSave(config: any) {
            var defaultForm = document.querySelector("form[name$='defaultForm']");
            var okButton = defaultForm.querySelector("button[id$='saveButton']");
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
            var requiredParameterList = this.requiredParameters.addServer;

            this.actions
                .withConfig(config, requiredParameterList)
                .open(config.url, 'open main page')
                .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                .open(config.url + '/' + addServerPath, 'open addServer page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                .then(this.clickAddServer, 'clickAddServer', this.hasAddServerButton, this.exitOnTimeout, 500, 10000)
                .then(this.enterNameInput, 'enterNameInput', () => { return document.querySelector("table[id$='serversTable'] tbody tr[id*='new']") != null; }, this.exitOnTimeout, 500, 10000)
                .then(this.enterIntegrationServerOrMonitorHostInput, 'enterIntegrationServerOrMonitorHostInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.enterPortInput, 'enterPortInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.clickSave, 'clickSave', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.noop, 'sleep 1secondsAfterServerEntry', (config: any) => { return false; }, this.noop, 1000, 1000)
                .end(this.end);
        }


        public configure() {
            this.actions.run();
        }

    }

    SystemSettings.prototype.requiredParameters = {
        addServer: ['loginUserName', 'loginPassword', 'name', 'integrationServerOrMonitorHost', 'port', 'useSSL']
    }

}