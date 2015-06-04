class Step {
    name: string;
    nextStep: Step;
    page: WebPage;
    phantom: Phantom;
    config: any;
    result: any;
    screenDumpFileFullName: string;
    stepPrerequisite: (config: any) => boolean;
    timeOutCallback: (step:Step) => void;
    intervalMillis: number;
    timeOutMillis: number;
    index: number;
    considerationEvaluation: (result: any) => boolean;

    constructor(name: string, config: any, phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) =>boolean, screenDumpFileFullName:string) {
        this.name = name;
        this.config = config;
        this.phantom = phantom;
        this.page = page;
        this.timeOutMillis = timeOutMillis;
        this.intervalMillis = intervalMillis;
        this.timeOutCallback = timeOutCallback;
        this.stepPrerequisite = stepPrerequisite;
        this.screenDumpFileFullName = screenDumpFileFullName;            
        this.considerationEvaluation = considerationEvaluation;
    }

    public clone: ()=>Step= () => { console.log('WARNING: Clone need to be specific.'); return null;  }

    copy(step: Step) {
        this.name = step.name;
        this.config = step.config;
        this.phantom = step.phantom;
        this.page = step.page;
        this.timeOutMillis = step.timeOutMillis;
        this.intervalMillis = step.intervalMillis;
        this.timeOutCallback = step.timeOutCallback;
        this.stepPrerequisite = step.stepPrerequisite;
        this.screenDumpFileFullName = step.screenDumpFileFullName;
        this.considerationEvaluation = step.considerationEvaluation;      
    }

    run = () => {
        this.executeWithWaitForReadyState();
    }

    runSpecific = () => {console.log('WARNING: Step execution need to be specific.')}

    executeWithWaitForReadyState= () => {
        var start = new Date().getTime();
        var condition = false;
        var page = this.page;
        var phantom = this.phantom;
        var timeOutMillis = this.timeOutMillis;
        var intervalMillis = this.intervalMillis;
        var timeOutCallback = this.timeOutCallback;
        var testPrerequisite = this.stepPrerequisite;
        var runSpecific = this.runSpecific;
        var currentStep = this;
        var stepName = this.name;
        var screenDumpFileFullName = this.screenDumpFileFullName;
        var considerationEvaluation = this.considerationEvaluation;
        var config = this.config;
        console.log('starting ' + stepName);
        var interval = setInterval(function () {
            var timedOut = (new Date().getTime() - start > timeOutMillis);
            try {
                var execute = (considerationEvaluation == undefined || considerationEvaluation(config.results));
                if (!execute) {
                    return;
                }
                var prerequisiteMet = page.evaluate(testPrerequisite, config);
                if (prerequisiteMet) {
                    runSpecific();
                    return;
                }

                if (timedOut && timeOutCallback!=null ) {
                    timeOutCallback(currentStep);
                    return;
                }
                console.log('waiting for prerequisite to be met...' + testPrerequisite);
            }
            catch (err) {
                console.log('Exception occured:' + err);
                phantom.exit(0);
            }
            finally {
                if (!execute||prerequisiteMet || timedOut) {
                    clearInterval(interval);
                    var reason:string = 'unknown';

                    if (!execute) {
                        reason = 'skip';            
                    }

                    if (prerequisiteMet) {
                        reason = 'execution finished';
                    }

                    if (timedOut) {
                        reason = 'prerequisite was not met';
                    }

                    console.log('completed ' + stepName + ' because ' + reason );
                    if (screenDumpFileFullName != undefined) {
                        page.render(screenDumpFileFullName);
                    }
                    if (currentStep.nextStep !== undefined) {
                        console.log('moving to next step');
                        currentStep.nextStep.run();
                    }
                }
            }
        }, intervalMillis);
    }
}