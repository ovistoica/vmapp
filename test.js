const UIDGenerator = require('uid-generator');

const uidgen = new UIDGenerator(UIDGenerator.BASE32, 10);

uidgen.generate().then(uid => console.log(uid));