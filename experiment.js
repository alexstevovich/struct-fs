import structFs from './src/index.js';

structFs('./', {
    recursive: true,
    dirMode: 'redact',
})
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((err) => console.error(err.message));
