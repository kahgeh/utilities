/// <reference path="typings/phantomjs/phantomjs.d.ts"/>
/// <reference path="Step.ts"/>
/// <reference path="SecureString.ts"/>
class SendEventStep extends Step {
    eventName: string;
    eventData: any;

    constructor(eventName: string, eventData: string, name: string, config: any, phantom: Phantom, page: WebPage, stepPrerequisite: (config: any) => boolean, timeOutCallback: (step: Step) => void, intervalMillis: number, timeOutMillis: number, considerationEvaluation: (result: any) => boolean,screenDumpFileFullName: string) {
        super(name, config, phantom, page, stepPrerequisite, timeOutCallback, intervalMillis, timeOutMillis, considerationEvaluation, screenDumpFileFullName);
        this.eventName = eventName;
        this.eventData = eventData;
    }
    
    public clone: () => Step = () => {
        return new SendEventStep(this.eventName, this.eventData,this.name, this.config, this.phantom, this.page, this.stepPrerequisite, this.timeOutCallback, this.intervalMillis, this.timeOutMillis, this.considerationEvaluation, this.screenDumpFileFullName);
    }

    copy(step: Step) {
        super.copy(step);
        var typedStep: any = step;
        this.eventName = typedStep.eventName;
        this.eventData = typedStep.eventData;
    }

    runSpecific = () => {
        var eventName = this.eventName;
        var eventData = this.eventData;
        console.log('eventData=' + eventData);
        if (eventData.constructor == SecureString) {
            var secureString: SecureString = eventData;
            this.page.sendEvent(eventName, secureString.getSecureStringValue());
        }
        else {
            this.page.sendEvent(eventName, eventData);
        }
    }
} 