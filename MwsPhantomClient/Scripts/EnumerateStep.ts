/// <reference path="typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="Step.ts"/>

class EnumerateStep extends Step {
    templateSubActions: Actions;
    resultStepName: string;

    constructor(resultStepName:string, templateSubActions:Actions, name: string, config: any, phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) => boolean, screenDumpFileFullName: string) {
        super(name, config, phantom, page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation, screenDumpFileFullName);
        this.templateSubActions= templateSubActions;
        this.resultStepName = resultStepName;

    }

    copy(step: Step) {
        super.copy(step);
        var typedStep: any = step;
        this.templateSubActions = typedStep.templateSubActions;
        this.resultStepName = typedStep.resultStepName;
    }

    runSpecific = () => {
        var list: any[] = this.config.results[this.resultStepName];
        var templateSubActions = this.templateSubActions;
        var subActions = new Actions(templateSubActions.page, templateSubActions.phantom, templateSubActions.screenDumpRepository);
        if (list.length < 1) {
            return;
        }
        for (var i = 0; i < list.length; i++) {
            var name = this.name + i ;
            this.templateSubActions.copyTo(subActions, name, { currentItem: list[i], currentIndex: i, parentConfig: this.config,results:{}});
        }
        var originalNextStep = this.nextStep ;
        this.nextStep = subActions.steps[0];
        subActions.steps[subActions.steps.length - 1].nextStep = originalNextStep;
    }
} 
