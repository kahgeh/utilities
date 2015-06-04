/// <reference path="./scripts/Actions.ts"/>
/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="configtypebase.ts" />
module ConfigTypes {
    export class DirectoryServices extends ConfigTypeBase{
        actions: Actions;
        page: WebPage;
        phantom: Phantom;
        screenDumpRepository: string;
        createDirectoryServicesPath: string;
        requiredParameters: { createDirectoryServices: string[] };

        constructor(phantom: Phantom, screenDumpRepository: string) {
            super();
            this.page = require('webpage').create();
            this.page.viewportSize = { width: 1024, height: 2048 };
            this.phantom = phantom;
            this.screenDumpRepository = screenDumpRepository;
            this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
            this.createDirectoryServicesPath = 'webm.apps.config.directory.service.admin';
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

        clickOnCreateLink(config: any) {
            var createLink: any = document.querySelector("a[href$='create']");
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            createLink.dispatchEvent(ev);
        }

        clickNext(config: any) {
            var nextButton = document.querySelector("input[value*='Next']");
            var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            nextButton.dispatchEvent(ev);
        }

        submitForm(config: any) {
            var form: any = document.querySelector("form[name^='wizardForm']");
            form.submit();
        }

        fillForm(config: any) {
            function setFormTextBoxValue(form, name, value) {
                var input = form.querySelector("input[name='" + name + "']");
                input.value = value;
            }
            var form = document.querySelector("form[name^='wizardForm']");
            setFormTextBoxValue(form, 'baseDN', config.baseDN);
            setFormTextBoxValue(form, 'failoverURL', config.failoverUrls);
            setFormTextBoxValue(form, 'groupObjectClass', config.groupObjectClass);
            setFormTextBoxValue(form, 'groupObjectClassFilter', config.groupObjectFilter);
            setFormTextBoxValue(form, 'name', config.directoryServiceName);
            setFormTextBoxValue(form, 'providerURL', config.providedUrl);
            setFormTextBoxValue(form, 'securityPrincipal', config.securityPrincipal);
            setFormTextBoxValue(form, 'userID', config.userAttributesUserId);
            setFormTextBoxValue(form, 'userObjectClassFilter', config.useObjectFilter);

            var defaultWildcardSearches: any = form.querySelector("select[name='defaultWildcardSearches']");
            defaultWildcardSearches.selectedIndex = 0;
            var groupOverService: any = form.querySelector("select[name='groupOverService']");
            groupOverService.selectedIndex = 0;
            var membershipQuickSearch: any = form.querySelector("select[name='membershipQuickSearch']");
            membershipQuickSearch.selectedIndex = 0;
        }

        focusPasswordInput(config: any) {
            var form = document.querySelector("form[name^='wizardForm']");
            var securityCredentials: any = form.querySelector("[name='securityCredentials']");
            securityCredentials.focus();
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

    public createDirectoryServicesSetup(config: any) {
            // verify config
            var missingConfig = [];
            var phantom = this.phantom;
            var exitOnTimeout = this.exitOnTimeout;
            var createDirectoryServicesPath = this.createDirectoryServicesPath;
            var noPrerequisite = this.noPrerequisite;
            var requiredParameterList = this.requiredParameters['createDirectoryServices'];
            this.actions
                .withConfig(config, requiredParameterList)
                .open(config.url, 'open main page')
                .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                .then(this.noop, 'sleep10secondsAfterLogin', (config: any) => { return false; }, this.noop, 10000, 10000)
                .open(config.url + '/' + createDirectoryServicesPath, 'openCreateDirectoryServices page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                .then(this.clickOnCreateLink, 'clickOnCreateLink', () => { return ((document.URL.toString().indexOf('webm.apps.config.directory.service.admin') > -1) && (document.querySelector("a[href$='create']") != null)); }, this.exitOnTimeout, 500, 10000)
                .then(this.clickNext, 'clickNext', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .then(this.fillForm, 'fillForm', () => { return document.querySelector("form[name^='wizardForm']") != null; }, this.exitOnTimeout, 500, 10000)
                .then(this.focusPasswordInput, 'focusPasswordInput', noPrerequisite, this.exitOnTimeout, 500, 10000)
                .sendEvent('keypress', config.securityCredentials, 'enter securityCredentials')
                .then(this.noop, 'sleep 1seconds', (config: any) => { return false; }, this.noop, 1000, 1000)
                .then(this.submitForm, 'submitForm', () => { return document.querySelector("form[name^='wizardForm']") != null; }, this.noop, 1000, 1000)
                .then(this.noop, 'sleep 2secondsDirectoryServices', (config: any) => { return false; }, this.noop, 1000, 1000)
                .end(this.end);
        }

        public configure() {
            this.actions.run();
        }

    }
    DirectoryServices.prototype.requiredParameters = {
        createDirectoryServices: ['loginUserName', 'loginPassword', 'url', 'directoryServiceName', 'providedUrl', 'baseDN', 'securityPrincipal', 'securityCredentials', 'failoverUrls', 'useObjectFilter', 'groupObjectFilter', 'userAttributesUserId', 'groupObjectClass']
    };
}