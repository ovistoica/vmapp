var fs = require('fs-extra');
var axios = require('axios');
var chalk = require('chalk');
const UIDGenerator = require('uid-generator');

var TOKEN = __dirname + '/' + '.token.json';
var SERVER = 'http://localhost:3000';
const GENERATOR = new UIDGenerator(UIDGenerator.BASE32, 10);
const WARNING = chalk.keyword('orange');
const BOLD = chalk.bold;

async function init() {
    try {
        await fs.ensureFile(TOKEN);
        var token = await fs.readJson(TOKEN);
        if (token) {
            var response = await authenticateToken(token);
            if (response.err === 0) {
                console.log('User logged in as:', response.user);
            } else {
                promptUser();
            }
        } else {
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
            url: SERVER + '/api/v1/vm/verify',
            headers: { 'Content-Type': 'application/json' },
            data: token
        });
        return response;
    } catch (err) {
        console.error(err);
    }
}

async function promptUser() {
    var loginLink = SERVER + '/vm.html';
    console.log(WARNING('Virtual Machine not authenticated.'));
    try {
        var code = await GENERATOR.generate();
    } catch (err) {
        console.error(err);
    }
    console.log('Activation Code:', BOLD(code));
    console.log(WARNING('Please follow this link and insert activation code to authenticate:', loginLink));
}