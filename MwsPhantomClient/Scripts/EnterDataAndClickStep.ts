/// <reference path="typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="Step.ts"/>

class EnterDataAndClickStep extends Step {
    stepDefinition:(config:any) => void ;

    constructor(stepDefinition: (config: any) => void, name: string, config: any,  phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) => boolean, screenDumpFileFullName: string) {
        super(name, config, phantom, page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation,screenDumpFileFullName);
        this.stepDefinition = stepDefinition

    }
    public clone: () => Step = () => {
        return new EnterDataAndClickStep(this.stepDefinition, this.name, this.config, this.phantom, this.page, this.stepPrerequisite, this.timeOutCallback, this.intervalMillis, this.timeOutMillis, this.considerationEvaluation, this.screenDumpFileFullName);
    }

    copy(step: Step) {
        super.copy(step);
        var typedStep:any = step;
        this.stepDefinition = typedStep.stepDefinition;
    }

    runSpecific = () => {
        var stepDefinition = this.stepDefinition;
        var config = this.config;
        var stepName = this.name;
        var result = this.page.evaluate(stepDefinition, config); 
        config.results[stepName] = result;
    }
} 