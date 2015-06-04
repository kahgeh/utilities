/// <reference path="BrokerConfigurations.ts"/>
/// <reference path="DirectoryServices.ts"/>
/// <reference path="EsbConfigurations.ts"/>
/// <reference path="TnConfigurations.ts"/>
/// <reference path="Scripts/minimist.ts"/>
/// <reference path="Scripts/secureString.ts"/>
var CAF: CAFType;

function getDateTimeFolderName() {
    var date = new Date();
    var uniqueFolderName: string = date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDate().toString() + date.getHours().toString() + date.getMinutes().toString() + date.getSeconds() + date.getMilliseconds().toString();
    return uniqueFolderName;
}

var sys = require("system");
if (sys.args.length < 3) {
    console.log('<configType e.g BrokerConfigurations> <operation e.g. addServer> <args...eg. server1 6879>');
    for (var configType in ConfigTypes) {
        if (configType == 'ConfigTypeBase') continue;
        console.log('\n');        
        console.log('ConfigType: ' + configType);
        for (var operation in ConfigTypes[configType].prototype.requiredParameters) {
            console.log('\n');
            console.log('Operation: ' + operation);
            var requiredParameters = ConfigTypes[configType].prototype.requiredParameters;
            console.log('args: ' + requiredParameters[operation].join(',') );
        }
        console.log('\n');        
    }
    phantom.exit(0);
}

var configType=sys.args[1];
var operation=sys.args[2];
var config :any= minimist(sys.args.slice(3), {});
var screenDumpRepository = 'D:/tmp/' + getDateTimeFolderName();
console.log('setting screen dump repository to ' + screenDumpRepository);

function createAndConfigure(configTypeName, operation, screenDumpRepository) {
    var configType = new ConfigTypes[configTypeName](phantom, screenDumpRepository);
    var getText = 'get';
    configType.printHelpIfRequested(operation, config);
    configType[operation + 'Setup'](config);
    if (operation.slice(0, getText.length) == getText) {
        configType.getResults();
    }
    else {
        configType.configure();
    }
}

createAndConfigure(configType, operation, screenDumpRepository);
