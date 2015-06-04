/// <reference path="./Scripts/Actions.ts"/>
/// <reference path="configtypebase.ts" />
module ConfigTypes {
    export class TnConfigurations extends ConfigTypeBase{
        actions: Actions;
        page: WebPage;
        phantom: Phantom;
        screenDumpRepository: string;
        addTnConfigPath: string;
        requiredParameters: { addTnConfig: string[] };

        constructor(phantom: Phantom, screenDumpRepository: string) {
            super();
            this.page = require('webpage').create();
            this.phantom = phantom;
            this.screenDumpRepository = screenDumpRepository;
            this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
            this.addTnConfigPath = 'webm.apps.tasks.admin.integration.b2b.tn.configs';
            
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

        enterTnConfigNameInput(config: any) {
            var tnConfigDialog = document.querySelector("div[id*='tnConfigDialog'][id*='content']");
            var tnConfigNameInput: any = tnConfigDialog.querySelector("input[id$='inPlaceText']");
            tnConfigNameInput.value = config.tnConfigName;
        }

        enterTnHostInput(config: any) {
            var tnConfigDialog = document.querySelector("div[id*='tnConfigDialog'][id*='content']");
            var tnHostInput: any = tnConfigDialog.querySelector("input[id$='selectedURL']");
            tnHostInput.value = config.tnHost;
        }

        enterTnPortInput(config: any) {
            var tnConfigDialog = document.querySelector("div[id*='tnConfigDialog'][id*='content']");
            var tnPortInput: any = tnConfigDialog.querySelector("input[id$='selectedURL1']");
            tnPortInput.value = config.tnPort;
        }

        clickAddTnConfig(config: any) {
            var defaultForm = document.querySelector("form[name$='defaultForm']");
            var addTnConfigButton: any = defaultForm.querySelector("button[id$='oneWayToggleButton']");
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            addTnConfigButton.dispatchEvent(ev);
        }

        clickOkAddTnConfig(config: any) {
            var tnConfigDialog = document.querySelector("div[id*='tnConfigDialog'][id*='content']");
            var allButtons: any = tnConfigDialog.querySelectorAll("button");

            var filterButtons = (buttons: any, innerText: string) => {
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].innerText.trim() == innerText.trim()) { return buttons[i]; }
                } return null;
            }
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

    public addTnConfigSetup(config: any) {
            // verify config
            var missingConfig = [];
            var phantom = this.phantom;
            var exitOnTimeout = this.exitOnTimeout;
            var addTnConfigPath = this.addTnConfigPath;
            var noPrerequisite = this.noPrerequisite;
            var requiredParameterList = this.requiredParameters.addTnConfig;

            this.actions
                .withConfig(config, requiredParameterList)
                .open(config.url, 'open main page')
                .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                .open(config.url + '/' + addTnConfigPath, 'open addTnConfigPath page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                .then(this.clickAddTnConfig, 'clickAddTnConfig', () => { return document.querySelector("form[name$='defaultForm'] button[id$='oneWayToggleButton']") != null; }, this.exitOnTimeout, 500, 10000)
                .then(this.enterTnConfigNameInput, 'enterTnConfigNameInput', () => { return document.querySelector("div[id*='tnConfigDialog'][id*='content']") != null; }, this.exitOnTimeout, 500, 10000)
                .then(this.enterTnHostInput, 'enterTnHostInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.enterTnPortInput, 'enterTnPortInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.noop, 'sleep 1secondsAfterTnConfigEntry', (config: any) => { return false; }, this.noop, 1000, 1000)
                .then(this.clickOkAddTnConfig, 'click add clickOkAddTnConfig', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .end(this.end);
        }


        public configure() {
            this.actions.run();
        }
    }

    TnConfigurations.prototype.requiredParameters = {
        addTnConfig: ['loginUserName', 'loginPassword', 'url', 'tnConfigName', 'tnHost', 'tnPort']
    };
}