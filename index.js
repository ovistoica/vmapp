var fs = require('fs-extra');
var axios = require('axios');
var chalk = require('chalk');
const UIDGenerator = require('uid-generator');
// var events = require('events').EventEmitter;
// var util = require('util');

var ACTIVATION_CODE;
var TOKEN = __dirname + '/' + '.token.json';
var SERVER = 'http://localhost:3000';
const GENERATOR = new UIDGenerator(UIDGenerator.BASE32, 10);
var ACTIVATED = false;
var LOGINLINK = SERVER + '/vm.html';

// Color prompts
const WARNING = chalk.keyword('orange');
const BOLD = chalk.bold;

async function authenticateToken(token) {
    try {
        var response = await axios({
            method: 'post',
            url: SERVER + '/api/v1/vm/remote/verify',
            headers: { 'Content-Type': 'application/json' },
            data: { token }
        });
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

async function validateClientId() {
    try {
        var response = await axios({
            method: 'post',
            url: SERVER + '/api/v1/vm/client/valid',
            headers: { 'Content-Type': 'application/json' },
            data: { clientId: ACTIVATION_CODE }
        });
    } catch (err) {
        console.log(err);
    }
}

async function saveToken(token) {
    var TOKEN = __dirname + '/' + '.token.json';
    try {
        await fs.writeJSON(TOKEN, { token });
    } catch (err) {
        console.log(err);
    }
}


async function init() {
    var exists = fs.existsSync(TOKEN);
    if (exists) {
        try {
            var token = await fs.readJson(TOKEN);
            if (token) {
                var response = await authenticateToken(token);
                if (response.err === 0) {
                    ACTIVATED = true;
                    console.log('User logged in as:', response.user);
                    saveToken(token);
                }
            }
        } catch (err) {
            console.error(err);
        }

    }
}


async function tokenPing() {
    if (!ACTIVATED) {

        var id = setInterval(async function() {
            try {
                var response = await axios({
                    method: 'post',
                    url: SERVER + '/api/v1/vm/remote/token',
                    headers: { 'Content-Type': 'application/json' },
                    data: { clientId: ACTIVATION_CODE }
                });
            } catch (err) {
                console.log(err);
            }
            if (response.data.err === 0) {
                ACTIVATED = true;
                console.log(response.data.token);
                saveToken(response.data.token);
            }
            if (ACTIVATED) {
                console.log('Clearing interval');
                clearInterval(id);
            }
        }, 5000);

    }
}


async function promptUser() {
    if (!ACTIVATED) {

        console.log(WARNING('Virtual Machine not authenticated.'));
        try {
            ACTIVATION_CODE = await GENERATOR.generate();
            await validateClientId();
        } catch (err) {
            console.log(err);
        }

        console.log(WARNING('Activation Code:'), BOLD(ACTIVATION_CODE));
        console.log(WARNING('Please follow this link and insert activation code to authenticate:'), BOLD(LOGINLINK));


        id = setInterval(async function() {
            console.log(WARNING('\n\nActivation Code Expired.'));
            try {
                ACTIVATION_CODE = await GENERATOR.generate();
                await validateClientId();
                console.log(WARNING('New Activation Code:'), BOLD(ACTIVATION_CODE));
                console.log(WARNING('Please follow this link and insert activation code to authenticate:'), BOLD(LOGINLINK));
            } catch (err) {
                console.log(err);
            }
            if (ACTIVATED) {
                clearInterval(id);
            }
        }, 120000);

    }
}

init();
promptUser();
tokenPing();