/// <reference path="Step.ts"/>

class ExitStep extends Step {
    nextStep: Step;
    page: WebPage;
    screenDumpFileFullName: string;
    end: () => void;
    url: string;
    endStepDefinition: (step: Step) => void;

    constructor(endStepDefinition: (step: Step) => void, name: string, config: any,phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) => boolean,  screenDumpFileFullName: string) {
        super(name, config,  phantom, page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation, screenDumpFileFullName);
        this.endStepDefinition = endStepDefinition;
    }

    public clone: () => Step = () => {
        return new ExitStep(this.endStepDefinition, this.name, this.config, this.phantom, this.page, this.stepPrerequisite, this.timeOutCallback, this.intervalMillis, this.timeOutMillis, this.considerationEvaluation, this.screenDumpFileFullName);
    }

    copy(step: Step) {
        super.copy(step);
        var typedStep: any = step;
        this.endStepDefinition = typedStep.endStepDefinition;
    }

    runSpecific = () => {
        var endStepDefinition = this.endStepDefinition;
        endStepDefinition(this); 
    }

}