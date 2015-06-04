/// <reference path="./scripts/Actions.ts"/>
/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="./scripts/typings/mwsscripts/mws.d.ts"/>
/// <reference path="utility.d.ts" />
/// <reference path="configtypebase.ts" />
module ConfigTypes {
    export class UserManagement extends ConfigTypeBase {
        actions: Actions;
        page: WebPage;
        phantom: Phantom;
        screenDumpRepository: string;
        rolesPath: string;
        usersPath: string;
        requiredParameters: { getRoleMembers: string[]; updateRole: string[]; updateUserList:string[]};

        constructor(phantom: Phantom, screenDumpRepository: string) {
            super();
            this.page = require('webpage').create();
            this.page.viewportSize = { width: 800, height: 600 };
            this.phantom = phantom;
            this.screenDumpRepository = screenDumpRepository;
            this.actions = new Actions(this.page, this.phantom, screenDumpRepository);
            this.rolesPath = 'webm.apps.user.administration.roles';
            this.usersPath = 'webm.apps.user.administration.users';
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

        roleExists(config: {roleName:string}) {
            var allRolesTd: any = document.querySelectorAll(".caf-table tbody tr td:nth-child(2)");
            return textExistsInTds(allRolesTd, config.roleName);
        }

        clickRoleLink(config: any) {
            var allRolesTd: any = document.querySelectorAll(".caf-table tbody tr td:nth-child(2)");
            function filterTds(tds, innerText) {
                for (var i = 0; i < tds.length; i++) {
                    if (tds[i].innerText.trim() == innerText) {
                        return tds[i];
                    }
                }
                return null;
            }
            var roleTd: any = filterTds(allRolesTd, config.roleName);
            var link = roleTd.querySelector('a')

        var ev = document.createEvent("MouseEvents");
            ev.initEvent("click", true, true);
            link.dispatchEvent(ev);
        }

        membersTabExists() {
            var allHeaders = document.querySelectorAll("ul.caf-tabs-top");
            var menuWithMembersLink = filterElements(allHeaders, 'Members');
            return (menuWithMembersLink != null);
        }

        clickMembersTabs(config: any) {
            var allHeaders = document.querySelectorAll("ul.caf-tabs-top");
            var menuWithMembersLink = filterElements(allHeaders, 'Members');
            var allLinks = menuWithMembersLink.querySelectorAll('li a');
            var membersLink = filterElements(allLinks, 'Members');
            if (membersLink != null) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                membersLink.dispatchEvent(ev);
            }
        }

        collectRoleMembers(config: any) {
            function collect(elements) {
                var collection = [];
                for (var i = 0; i < elements.length; i++) {
                    collection.push(elements[i].innerText);
                }
                return collection;
            }
            var menuWithMembersLink = filterElements(document.querySelectorAll("ul.caf-tabs-top"), 'Members');
            var roleMembersTds = menuWithMembersLink.parentElement.querySelectorAll(".caf-table tbody tr td:nth-child(2)");
            return collect(roleMembersTds);
        }

        roleDoesNotExists(resultBag: any) {
            return !resultBag.roleExists;
        }

        clickAddRole(config: any) {
            function click(button) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                button.dispatchEvent(ev);
            }
            var addRoleButton = document.querySelector("input[type='button'][value^='Add Role']");
            click(addRoleButton);
            return true;
        }

        addRoleWasClicked(resultBag: any) {
            return (resultBag.clickAddRole == true);
        }

        addRoleWasNotClicked(resultBag: any) {
            return !(resultBag.clickAddRole == true);
        }

        addRole(config: any) {
            function click(button) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                button.dispatchEvent(ev);
            }
            function getFirstAncestorWithTagName(element, tagName) {
                var parent = element;
                while (parent != null) {
                    if (parent.tagName == tagName) {
                        return parent;
                    }
                    parent = parent.parent;
                }
                return null;
            }
            var roleNameInput: any = document.querySelector("input[name='roleName']");
            roleNameInput.value = config.roleName;
            var staticRoleTd: any = document.querySelector("td span[title='Static Role Provider']");
            var staticRoleProviderLink: any = staticRoleTd.parentElement.parentElement.querySelector('td a img').parentElement;
            click(staticRoleProviderLink);
            var createRoleButton: any = document.querySelector("form input[value='Create Role'][type='submit']");
            createRoleButton.click();
        }

        collectMissingRoleMembers(config: any) {
            function existInArray(list: string[], value: string) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i] == value) {
                        return true;
                    }
                }
                return false;
            }
            function collect(elements) {
                var collection = [];
                for (var i = 0; i < elements.length; i++) {
                    collection.push(elements[i].innerText.trim());
                }
                return collection;
            }
            function click(button) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                button.dispatchEvent(ev);
            }
            var menuWithMembersLink = filterElements(document.querySelectorAll("ul.caf-tabs-top"), 'Members');
            var roleMembersTds = menuWithMembersLink.parentElement.querySelectorAll(".caf-table tbody tr td:nth-child(2)");
            var existingMembers = collect(roleMembersTds);
            var expectedMembers = [config.members];
            if (Array.isArray(config.members)) {
                expectedMembers = config.members;
            }
            var missingMembers: string[] = [];
            for (var i = 0; i < expectedMembers.length; i++) {
                var memberParts = expectedMembers[i].split('.');
                var name = memberParts[1];

                if (!existInArray(existingMembers, name)) {
                    missingMembers.push(expectedMembers[i]);
                }
            }
            return missingMembers;
        }

        clickEditMembersButton(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }
            var editMembersButton = document.querySelector("button[id$='editMembersButton']");
            click(editMembersButton);
        }

        clickGroupRadio(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }

            var memberParts = config.currentItem.split('.');
            var memberType = memberParts[0].toLowerCase() + 's';
            var memberName = memberParts[1];

            var groupsRadioInput = document.querySelector("input[id*='roleMembershipPicker'][value='" + memberType + "']");
            click(groupsRadioInput);
        }

        clickOnSaveButton(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }
            var editMembersButton: any = document.querySelector("button[id$='editMembersButton']");
            var submitBtn = editMembersButton.parentElement.querySelector("button[id$='submitBtn']");
            click(submitBtn);
        }

        searchMember(config: any) {
            function click(button) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                button.dispatchEvent(ev);
            }
            var memberParts = config.currentItem.split('.');
            var memberType = memberParts[0].toLowerCase() + 's';
            var memberName = memberParts[1];

            var searchGoButton = document.querySelector("button[id$='SearchGoButton']");
            var keywordsTextInput: any = document.querySelector("input[id$='keywordsTextInput']");
            keywordsTextInput.value = memberName;
            click(searchGoButton);
        }

        isInAvailableList(config: any) {
            var memberParts = config.currentItem.split('.');
            var memberType = memberParts[0].toLowerCase() + 's';
            var memberName = memberParts[1];


            var availableGroups = document.querySelectorAll("div[id*='roleMembershipPicker'] div[id*='peopleSwapBox'] ol li span div");
            var searchResult: any = filterElements(availableGroups, memberName);
            return (searchResult != null);
        }

        addMember(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }
            function filterCafModelList(list: any[], memberName: string) {
                for (var i = 0; i < list.length; i++) {
                    var personBlockId = list[i].getControlId('personBlock')

                var personBlock: any = document.querySelector("div[id='" + personBlockId + "']");
                    if (personBlock.innerText.trim() == memberName) {
                        return list[i];
                    }
                }
                return null;
            }
            var memberParts = config.currentItem.split('.');
            var memberType = memberParts[0].toLowerCase() + 's';
            var memberName = memberParts[1];

            var availableGroups = document.querySelectorAll("div[id*='roleMembershipPicker'] div[id*='peopleSwapBox'] ol li span div");
            var singleGroup: any = filterElements(availableGroups, memberName);
            var model: any = CAF.model(document.querySelector("div[id*='roleMembershipPicker'] div[id*='peopleSwapBox'] ol[id$='availablePrincipalsTable']"));
            var memberModel = filterCafModelList(model.list(), memberName);
            model.selectNone();
            model.setSelected(memberModel);
        }

        clickMoveRight(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }
            var moveRightButton = document.querySelector("div[id*='roleMembershipPicker'] div[id*='peopleSwapBox'] a[id*='moveRight']");
            click(moveRightButton);
        }

        clickOnApplyButton(config: any) {
            function click(element) {
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                element.dispatchEvent(ev);
            }
            var applyButton = document.querySelector("div[id*='roleMembershipPicker'] .caf-dialog-submit button[id$='applyButton']");
            click(applyButton);
        }

        endIfRoleDoesNotExist = (step: ExitStep) => {
            var page = step.page;
            var phantom = step.phantom;

            var previousStepResult = step.config.results['roleExists']
            if (!previousStepResult) {
                console.log('end in 5 seconds');
                setTimeout(function () {
                    page.close();
                    phantom.exit(0);
                }, 5000);
            }
        }

        collectMissingUsers(config: any) {
            
            var usersSection = filterElements(document.querySelectorAll(".portlet-container"), 'Users');
            var usersTds = usersSection.querySelectorAll(".caf-table tbody tr td:nth-child(2)");
            var existingUsers = collect(usersTds);
            var expectedUsers = [config.users];
            if (Array.isArray(config.users)) {
                expectedUsers = config.users;
            }
            var missingUsers: string[] = [];
            for (var i = 0; i < expectedUsers.length; i++) {
                if (!existInArray(existingUsers, expectedUsers[i])) {
                    missingUsers.push(expectedUsers[i]);
                }
            }
            return missingUsers;
        }

        clickAddUser() {
            var addUserButton=document.querySelectorAll("input.portlet-form-button[value='Add User...']")
        }
       returnGetRoleMembersResult = (step: ExitStep) => {
            var page = step.page;
            var phantom = step.phantom;
            var resultBag: any = step.config.results;
            console.log(JSON.stringify(step.config));
            var standardResultBag = { exists: resultBag.roleExists, list: resultBag.collectRoleMembers };
            console.log('***startResult***');
            console.log(JSON.stringify(standardResultBag));
            console.log('***endResult***');
            console.log('end in 5 seconds');
            setTimeout(function () {
                page.close();
                phantom.exit(0);
            }, 5000);
        }
        
        returnGetMissingUsersResult = (step: ExitStep) => {
            var page = step.page;
            var phantom = step.phantom;
            var resultBag: any = step.config.results;
            console.log(JSON.stringify(step.config));
            var standardResultBag = { list: resultBag.collectMissingUsers };
            console.log('***startResult***');
            console.log(JSON.stringify(standardResultBag));
            console.log('***endResult***');
            console.log('end in 5 seconds');
            setTimeout(function () {
                page.close();
                phantom.exit(0);
            }, 5000);
        }


        public getRoleMembersSetup(config: any) {

                var missingConfig = [];
                var phantom = this.phantom;
                var exitOnTimeout = this.exitOnTimeout;
                var rolesPath = this.rolesPath;
                var noPrerequisite = this.noPrerequisite;
                var requiredParameterList = this.requiredParameters.getRoleMembers;
                this.actions
                    .withConfig(config, requiredParameterList)
                    .open(config.url, 'open main page')
                    .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                    .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                    .open(config.url + '/' + rolesPath, 'open role page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                    .then(this.roleExists, 'roleExists', () => { return document.querySelector(".caf-table tbody") != null; }, this.exitOnTimeout, 1000, 10000)
                    .end(this.endIfRoleDoesNotExist, 'endIfRoleDoesNotExist')
                    .then(this.clickRoleLink, 'clickRoleLink', () => { return document.querySelector("input[type='button'][value^='Add Role']") != null; }, this.exitOnTimeout, 500, 10000)
                    .then(this.clickMembersTabs, 'clickMembersTabs', this.membersTabExists, this.exitOnTimeout, 500, 10000)
                    .then(this.collectRoleMembers, 'collectRoleMembers', () => { return document.querySelector("button[id$='editMembersButton']") != null; }, this.exitOnTimeout, 500, 10000)
                    .then(this.noop, 'sleep 2secondsDirectoryServices', (config: any) => { return false; }, this.noop, 1000, 1000)
                    .end(this.returnGetRoleMembersResult);
            }

        public updateRoleSetup(config: any) {
                config.members = config.members.split(',');
                var missingConfig = [];
                var phantom = this.phantom;
                var exitOnTimeout = this.exitOnTimeout;
                var rolesPath = this.rolesPath;
                var noPrerequisite = this.noPrerequisite;
                var requiredParameterList = this.requiredParameters.updateRole;
                var addMembersActions = new Actions(this.page, this.phantom, this.screenDumpRepository);
                addMembersActions
                    .then(this.clickEditMembersButton, 'clickEditMembersButton', noPrerequisite, this.exitOnTimeout, 500, 10000)
                    .then(this.clickGroupRadio, 'clickGroupRadio', () => { return document.querySelector("input[id$='keywordsTextInput']") != null; }, this.exitOnTimeout, 500, 10000)
                    .then(this.searchMember, 'searchMember', this.noPrerequisite, this.exitOnTimeout, 500, 10000)
                    .then(this.noop, 'sleep2seconds', (config: any) => { return false; }, this.noop, 2000, 2000)
                    .then(this.addMember, 'forMissingMember', this.isInAvailableList, this.exitOnTimeout, 500, 10000)
                    .then(this.clickMoveRight, 'clickMoveRight', this.noPrerequisite, this.noop, 2000, 2000)
                    .then(this.clickOnApplyButton, 'clickOnApplyButton', this.noPrerequisite, this.exitOnTimeout, 500, 10000);

                this.actions
                    .withConfig(config, requiredParameterList)
                    .open(config.url, 'open main page')
                    .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                    .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                    .open(config.url + '/' + rolesPath, 'open role page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                    .then(this.roleExists, 'roleExists', () => { return document.querySelector(".caf-table tbody") != null; }, this.exitOnTimeout, 500, 10000)
                    .then(this.clickAddRole, 'clickAddRole', () => { return document.querySelector("input[type='button'][value^='Add Role']") != null; }, this.exitOnTimeout, 500, 10000, this.roleDoesNotExists)
                    .then(this.addRole, 'addRole', () => { return document.querySelector("td span[title='Static Role Provider']") != null }, this.exitOnTimeout, 500, 10000, this.addRoleWasClicked)
                    .then(this.clickRoleLink, 'clickRoleLink', () => { return document.querySelector("input[type='button'][value^='Add Role']") != null; }, this.exitOnTimeout, 500, 10000, this.addRoleWasNotClicked)
                    .then(this.clickMembersTabs, 'clickMembersTabs', this.membersTabExists, this.exitOnTimeout, 500, 10000)
                    .then(this.collectMissingRoleMembers, 'collectMissingRoleMembers', () => { return document.querySelector("button[id$='editMembersButton']") != null; }, this.exitOnTimeout, 500, 10000)
                    .enumerate('collectMissingRoleMembers', addMembersActions, 'addMembers', noPrerequisite, this.exitOnTimeout, 500, 10000)
                    .then(this.noop, 'sleep2secondsAfterAddingMembers', (config: any) => { return false; }, this.noop, 1000, 1000)
                    .then(this.clickOnSaveButton, 'clickOnSaveButton', () => { return document.querySelector("ul.caf-tabs-top li a") != null; }, this.exitOnTimeout, 500, 10000)
                    .end(this.returnGetRoleMembersResult);

            }

        public updateUserListSetup(config: any) {
            var missingConfig = [];
            config.users = config.users.split(',');
            var phantom = this.phantom;
            var exitOnTimeout = this.exitOnTimeout;
            var usersPath = this.usersPath;
            var noPrerequisite = this.noPrerequisite;
            var requiredParameterList = this.requiredParameters.updateUserList;

            this.actions
                .withConfig(config, requiredParameterList)
                .open(config.url, 'open main page')
                .then(this.login, 'login', (config: any) => { return document.querySelector("#wm_login-username") != null; }, this.exitOnTimeout, 1000, 20000)
                .then(this.noop, 'sleep 2secondsAfterLogin', (config: any) => { return false; }, this.noop, 2000, 2000)
                .open(config.url + '/' + usersPath, 'open users page', (config: any) => { return document.querySelector('#header > div > div > div.banner > table > tbody > tr > td.banner-links') != null; }, this.exitOnTimeout)
                .then(this.collectMissingUsers, 'collectMissingUsers', () => { return document.querySelector("span.caf-content span.caf-title") != null; }, this.exitOnTimeout, 500, 10000)
                .end(this.returnGetMissingUsersResult);
        }

        public configure() {
                this.actions.run();
            }

        public getResults() {
                this.actions.run();
        }
    }
    UserManagement.prototype.requiredParameters = {
        getRoleMembers: ['loginUserName', 'loginPassword', 'url', 'roleName'],
        updateRole: ['loginUserName', 'loginPassword', 'url', 'roleName', 'members'],
        updateUserList: ['loginUserName', 'loginPassword', 'url', 'users']

    };
}