/// <reference path="./scripts/typings/phantomjs/phantomjs.d.ts"/>
module ConfigTypes {
    export class ConfigTypeBase {
        phantom: Phantom;
        requiredParameters: any;
        public printHelpIfRequested = (opName: string, config: any) => {
            if (config['h'] || config['?']) {
                console.log(this.requiredParameters[opName]);
                this.phantom.exit(0);
            }
        }

    }
} 