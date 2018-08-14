import tstFunc from './sw-test-import';

// <version_template
const VERSION = '0.1';
const files = [];
// end_version_template>


export function helloWorld() {
    console.log(VERSION, files);
    console.log('Hello world');
    tstFunc();
}
