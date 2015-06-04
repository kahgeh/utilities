/// <reference path="typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="Step.ts"/>

class OpenPageStep extends Step{
    url: string;

    constructor(url: string, name: string, config: any, phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) => boolean, screenDumpFileFullName: string) {
        super(name, config, phantom, page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation,screenDumpFileFullName);
        this.url = url;
    }
    
    public clone: () => Step = () => {
        return new OpenPageStep(this.url, this.name, this.config, this.phantom, this.page, this.stepPrerequisite, this.timeOutCallback, this.intervalMillis, this.timeOutMillis, this.considerationEvaluation, this.screenDumpFileFullName);
    }

    copy(step: Step) {
        super.copy(step);
        var typedStep: any = step;
        this.url = typedStep.url;
    }

    runSpecific = () => {
        var url = this.url;
        var phantom = this.phantom;
        this.page.open(url,
            function (status) {
                if (status !== "success") {
                    console.log("failed to open " + url);
                    phantom.exit(1);
                }
            });
    }
} 