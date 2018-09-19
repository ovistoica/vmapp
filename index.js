var fs = require('fs-extra');
var axios = require('axios');
var chalk = require('chalk');
const UIDGenerator = require('uid-generator');
var events = require('events').EventEmitter;
var util = require('util');

var Authenticator = {
    getToken: async function() {

    },
    success: async function(token) {

    }
}

var ACTIVATION_CODE;
var TOKEN = __dirname + '/' + '.token.json';
var SERVER = 'http://localhost:3000';
const GENERATOR = new UIDGenerator(UIDGenerator.BASE32, 10);
var ACTIVATED;

// Color prompts
const WARNING = chalk.keyword('orange');
const BOLD = chalk.bold;

async function init() {
    try {
        await fs.ensureFile(TOKEN);
        var token = await fs.readJson(TOKEN);
        if (token) {
            var response = await authenticateToken(token);
            if (response.err === 0) {
                ACTIVATED = true;
                console.log('User logged in as:', response.user);
            } else {
                ACTIVATED = false;
                promptUser();
            }
        } else {
            ACTIVATED = false;
            promptUser();
        }
    } catch (err) {
        console.error(err);
    }
}

async function authenticateToken(token) {
    try {
        var response = await axios({
            method: 'post',
            url: SERVER + '/api/v1/vm/remote/verify',
            headers: { 'Content-Type': 'application/json' },
            data: token
        });
        return response.data;
    } catch (err) {
        console.error(err);
    }
}

async function getToken(token) {
    try {
        var response = await axios({
            method: 'post',
            url: SERVER + '/api/v1/vm/remote/token',
            headers: { 'Content-Type': 'application/json' },
            data: { clientId: ACTIVATION_CODE }
        });
        return response.data;
    } catch (err) {
        console.error(err);
    }
}

async function promptUser() {
    var loginLink = SERVER + '/vm.html';
    console.log(WARNING('Virtual Machine not authenticated.'));
    try {
        ACTIVATION_CODE = await GENERATOR.generate();
    } catch (err) {
        console.error(err);
    }
    console.log('Activation Code:', BOLD(ACTIVATION_CODE));
    console.log(WARNING('Please follow this link and insert activation code to authenticate:', loginLink));
}

// setInterval(async function() {
//     try {
//         var response = await axios({
//             method: 'post',
//             url: SERVER + '/api/v1/vm/token',
//             headers: { 'Content-Type': 'application/json' },
//             data: token
//         });
//         return response;
//     } catch (err) {
//         console.error(err);
//     }
// }
// }, 10000);
var tok = { token: '8781f264-2248-45ac-bea3-fd677d1bc260e6b634a2-9d03-4397-81b4-20290d528ca3734fb192-a98a-4234-80fe-d55391a63ac04f79762c-8c02-46f8-b1ba-41395aa9622c' }
    // promptUser();
    // authenticateToken(tok);