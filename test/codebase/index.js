const util = require('./src/util');
const helper = require('./src/helper');

function main() {
    const result = util.doSomething();
    helper.doSomethingElse(result);
}
