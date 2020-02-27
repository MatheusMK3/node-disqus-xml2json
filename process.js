// We'll be using Moment.js to handle dates
const moment = require('moment')

// Imports the Disqus JSON file
const disqusThreads = require('./disqus.json')

// Notification that everything loaded fine
console.info(`Loaded ${ Object.keys(disqusThreads).length } threads into memory from disqus.json`)

// Do whatever you want with it :)

// Manually handles every thread
Object.values(disqusThreads).map(thread => {
  // Then every post
  thread.posts.map(comment => {
    // Ignores deleted comments
    if ('true' === comment.isDeleted)
      return

    // Extracts the comment date
    const comment_date = moment(comment.createdAt)

    // Do whatever you want with it :)
  })
})