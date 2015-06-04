/// <reference path="typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="EnterDataAndClickStep.ts"/>
/// <reference path="ExitStep.ts"/>
/// <reference path="OpenPageStep.ts"/>
/// <reference path="SendEventStep.ts"/>
/// <reference path="EnumerateStep.ts"/>

class Actions {
    steps: Step[];
    page: WebPage;
    phantom: Phantom;
    screenDumpRepository: string;
    config: any;
    constructor(page: WebPage, phantom: Phantom, screenDumpRepository:string = 'C:/tmp') {
        this.page = page;
        this.phantom = phantom;
        this.screenDumpRepository = screenDumpRepository;
        this.steps = [];
        
        page.onConsoleMessage = function (msg) {
            console.log(msg);
        };
        page.onUrlChanged = function (targetUrl) {
            console.log('New URL: ' + targetUrl);
            page.injectJs('Utility.js');
        };

        page.onAlert= function (msg) {
            console.log('Alert warning : ' + msg);
        };
      
    }

    assignStep = (newStep: Step) => {

        if (newStep.screenDumpFileFullName === undefined && this.screenDumpRepository !== undefined) {
            newStep.screenDumpFileFullName = this.screenDumpRepository + '/post' + newStep.name.replace(' ', '') + '.png'
        }
        var stepsSize = this.steps.length;
        if (stepsSize > 0) {
            this.steps[stepsSize - 1].nextStep = newStep;
        }
        newStep.index = this.steps.length - 1;
        this.steps.push(newStep);
    }
    getResultBag = () => {
        var allSteps = this.steps;
        var resultBag = {};
        for (var i = 0; i < allSteps.length; i++) {
            if (allSteps[i].result != null) {
                var name=allSteps[i].name.replace(' ', '');
                resultBag[name] = allSteps[i].result;
            }
        }
        return resultBag;
    }
    validateConfig(config:any, expectedConfigNames:string[]) {
        var missingConfigNames = [];

        expectedConfigNames.forEach(function (expectedConfigName) {
            if (!config.hasOwnProperty(expectedConfigName)) { missingConfigNames.push(expectedConfigName); }
        });
        if (missingConfigNames.length > 0) {
            var missingConfigMessage='The following values are required but were not provided : ' + missingConfigNames.join(',');
            console.log(missingConfigMessage);
            this.phantom.exit(1);
        }
    }

    withConfig(config: any, expectedConfigNames: string[]=null) {
        if (expectedConfigNames != null) {
            this.validateConfig(config, expectedConfigNames);
        }
        if (config.results == null) {
            config.results = {};
        }
        this.config = config;
        return this;
    }

    open(url, name: string, stepPrerequisite: (config: any) => boolean = function (config: any) { return true; }, timeOutCallback: (step: Step) => void = (step: Step) => { step.phantom.exit(1) }, intervalMillis: number = 500, timeOutMillis: number = 10000, considerationEvaluation: (result: any) => boolean= undefined, screenDumpFileFullName: string= undefined) {
        this.assignStep(new OpenPageStep(url, name, this.config, this.phantom, this.page, stepPrerequisite, timeOutCallback, intervalMillis,  timeOutMillis, considerationEvaluation,screenDumpFileFullName));
        return this;
    }
    then(stepDefinition: (config: any) => void, name: string, stepPrerequisite: (config: any) => boolean = function (config: any) { return true; }, timeOutCallback: (step: Step) => void = (step: Step) => { step.phantom.exit(1) }, intervalMillis: number = 500, timeOutMillis: number = 10000, considerationEvaluation: (result: any) => boolean= undefined, screenDumpFileFullName: string= undefined) {
        this.assignStep(new EnterDataAndClickStep(stepDefinition, name, this.config,  this.phantom, this.page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation,screenDumpFileFullName));
        return this;
    }
    enumerate(resultStepName:string,templateSubActions: Actions, name: string, stepPrerequisite: (config: any) => boolean = function (config: any) { return true; }, timeOutCallback: (step: Step) => void = (step: Step) => { step.phantom.exit(1) }, intervalMillis: number = 500, timeOutMillis: number = 10000, considerationEvaluation: (result: any) => boolean= undefined, screenDumpFileFullName: string= undefined) {
        this.assignStep(new EnumerateStep(resultStepName, templateSubActions, name, this.config, this.phantom, this.page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation, screenDumpFileFullName));
        return this;
    }
    sendEvent(eventName: string, eventData: string, name: string, stepPrerequisite: (config: any) => boolean = function (config: any) { return true; }, timeOutCallback: (step: Step) => void = (step: Step) => { step.phantom.exit(1) }, intervalMillis: number = 500, timeOutMillis: number = 10000, considerationEvaluation: (result: any) => boolean= undefined, screenDumpFileFullName: string= undefined) {
        this.assignStep(new SendEventStep(eventName, eventData, name, this.config, this.phantom, this.page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation,screenDumpFileFullName));
        return this;
    }
    public end = (endStepDefinition, name: string='final', stepPrerequisite: (config: any) => boolean = function (config: any) { return true; }, timeOutCallback: (step: Step) => void = (step: Step) => { step.phantom.exit(1) }, intervalMillis: number = 500, timeOutMillis: number = 10000, considerationEvaluation: (result: any) => boolean= undefined, screenDumpFileFullName: string= undefined)=> {
        this.assignStep(new ExitStep(endStepDefinition, name, this.config, this.phantom, this.page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation,screenDumpFileFullName));
        return this;
    }

    public copyTo(targetActions: Actions, name:string, config:any) {
        var steps = this.steps;
        for (var i = 0; i < steps.length; i++) {
            var clonedStep = steps[i].clone();
            clonedStep.config = config;
            clonedStep.name = name + clonedStep.name;  
            targetActions.assignStep(clonedStep );
        } 
    }
    public run=()=> {
        if (this.steps.length < 1) {
            console.log('run - step length ' + this.steps.length);
            return;
        }
        this.steps[0].run();
    }

}