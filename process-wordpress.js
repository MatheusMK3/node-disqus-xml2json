// We'll be using Moment.js to handle dates
const moment = require('moment')

// This is necessary to correctly format SQL for the WP database
const sqlstr = require('sqlstring')

// Imports the Disqus JSON file
const disqusThreads = require('./disqus.json')

// Notification that everything loaded fine
console.info(`Loaded ${ Object.keys(disqusThreads).length } threads into memory from disqus.json`)

// Generates the RegEx'es that will match any thread without an associated WP id, based-off their URLs (your-blog-here.com/id/ and your-blog-here.com/?p=id)
const regexIdPermalink = /your-blog-here\.com\/([\d]+)\//
const regexIdWordpress = /your-blog-here\.com\/\?p=([\d]+)/

// Opens the output SQL file for writing
const output = require('fs').createWriteStream('disqus.sql')

// Manually handles every thread
Object.values(disqusThreads).map(thread => {

  // Tries to find the post ID via RegEx
  if (!thread.id || !thread.id.split) {
    if (regexIdPermalink.test(thread.link))
      thread.id = regexIdPermalink.exec(thread.link)[1].toString()
    else if (regexIdWordpress.test(thread.link))
      thread.id = regexIdWordpress.exec(thread.link)[1].toString()
    else
      return console.warn('Skipping thread without ID:', thread.link)
  }

  // Assigns the post ID that will be used later
  const wp_post_id = parseInt(thread.id.split(' ').shift())
  
  // If no post ID, just skip this thread
  if (!wp_post_id)
    return console.warn('Skipping thread without ID:', thread.link)

  thread.posts.map(comment => {
    // Ignores deleted comments
    if ('true' === comment.isDeleted)
      return

    // Extracts the comment date
    const comment_date = moment(comment.createdAt)

    // Detects any posts not already in WordPress
    if (!comment.id || !comment.id.indexOf || !~comment.id.indexOf('wp_id')) {
      // Creates the correct post structure on WP
      const wp_comment = {
        comment_post_ID: wp_post_id,
        comment_author: comment.name,
        comment_author_email: '',
        comment_date: comment_date.local().format('YYYY-MM-DD HH:mm:ss'),
        comment_date_gmt: comment_date.utc().format('YYYY-MM-DD HH:mm:ss'),
        comment_content: comment.message,
        comment_content_filtered: '',
      }

      // Writes the INSERT statement
      output.write(sqlstr.format(`INSERT INTO wp_comments (comment_post_ID, comment_author, comment_author_email, comment_date, comment_date_gmt, comment_content) VALUES (?, ?, ?, ?, ?, ?);`, [
        wp_comment.comment_post_ID,
        wp_comment.comment_author,
        wp_comment.comment_author_email,
        wp_comment.comment_date,
        wp_comment.comment_date_gmt,
        wp_comment.comment_content,
        wp_comment.comment_content_filtered,
      ]) + '\n')
    }
  })
})