// Imports the Disqus JSON file
const disqusThreads = require('./disqus.json')

// Notification that everything loaded fine
console.info(`Loaded ${ Object.keys(disqusThreads).length } threads into memory from disqus.json`)

// Do whatever you want with it :)