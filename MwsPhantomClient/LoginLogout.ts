/// <reference path="./scripts/Actions.ts"/>
/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>

class LoginLogout {
    actions: Actions;
    page: WebPage;
    phantom: Phantom;
    screenDumpRepository: string;
    addServerPath: string;
    requiredParameters: any;

    constructor(phantom: Phantom, screenDumpRepository: string) {
        this.page = require('webpage').create();
        this.phantom = phantom;
        this.screenDumpRepository = screenDumpRepository;
        this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
        this.requiredParameters = {
            addServer: ['loginUserName', 'loginPassword', 'url']
        }
    }

    public printHelpIfRequested = (opName: string, config: any) => {
        if (config['h'] || config['?']) {
            console.log(this.requiredParameters[opName]);
            this.phantom.exit(0);
        }
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

    logout(config: any) {
        function filterElements(elements, innerText) {
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].innerText.indexOf(innerText) > -1) {
                    return elements[i];
                }
            }
            return null;
        }

        var bannerLinks = document.querySelectorAll('.banner-links a');
        var logoutLink = filterElements(bannerLinks, 'Logout');
        logoutLink.click();

    }

    ensureSelectedTabExists(config: any) {
        var selectedTab = document.querySelectorAll('#tabBar a span[class*="tab_selected"]');
        config.results.overviewSteps( (selectedTab != null && selectedTab.length > 1 )
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

    public loginLogout(config: any) {
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
            .then(this.logout, 'logout', this.ensureSelectedTabExists, this.exitOnTimeout, 1000, 20000)
            .end(this.end);
    }


    public configure() {
        this.actions.run();
    }

}