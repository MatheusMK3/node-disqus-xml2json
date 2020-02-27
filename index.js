function convertXmlToJson (xmlFile, jsonFile, callback) {
  const fs = require('fs')

  const expat = require('node-expat')
  const parser = new expat.Parser('UTF-8')

  let currentTag = null
  let currentObj = {}
  let currentEntry = {}
  let currentEntryTag = null
  let ignoreTags = ['disqus']

  let timeoutSave = null

  const disqus_threads = {}
  const disqus_totals = {}

  function finishedAll () {
    // Notify we didn't have any more posts or threads
    console.info('Finished processing listings:')

    // Show accounting
    Object.keys(disqus_totals).map(type => console.info(`+ ${ type }: ${ disqus_totals[type] }`))

    // Notify we're saving
    console.info(`Saving final ${jsonFile} file...`)
    
    // Does the saving
    if (jsonFile)
      fs.writeFileSync(jsonFile, JSON.stringify(disqus_threads))

    // Finished
    console.info('Done!')

    // Callback
    if (callback)
      callback(disqus_threads)
  }

  // Whenever a valid entry is found (<thread> or <post>)
  function finishedEntry (tag, entry) {
    // Accounting :)
    if (!disqus_totals[tag])
      disqus_totals[tag] = 0
    disqus_totals[tag]++

    // Handles threads
    if (tag == 'thread') {
      disqus_threads[entry['dsq:id']] = entry
      disqus_threads[entry['dsq:id']].posts = []

      console.info('Processing thread:', entry['dsq:id'])
    }

    // Handles individual posts
    if (tag == 'post') {
      disqus_threads[entry['thread']['dsq:id']].posts.push(entry)

      console.info('Processing post:', entry['dsq:id'], '@', entry['thread']['dsq:id'])
    }
    
    // Handles after processing
    if (timeoutSave) clearTimeout(timeoutSave)
    timeoutSave = setTimeout(finishedAll, 1000)
  }

  // Detects a new XML element
  parser.on('startElement', (tag, attrs) => {
    // Handles ignored tags
    if (~ignoreTags.indexOf(tag)) return

    if (null == currentEntryTag) {
      // If we don't have any currently running entry, this will be it
      currentEntry = attrs
      currentEntryTag = tag
    } else {
      // If we already have a running entry, we're gonna handle as if this weas a property instead
      currentTag = tag
      currentObj = attrs
    }
  })

  // Detects XML text
  parser.on('text', function (text) {
    if (Object.keys(currentObj).length == 0)
      currentObj = text
    else
      currentObj['<>'] = text
  })

  // Detects a closing XML element
  parser.on('endElement', (tag) => {
    if (currentEntryTag == tag) {
      // If our current entry has the same tag (<thread> or <post>) we finish it
      finishedEntry(currentEntryTag, currentEntry)
      currentEntryTag = null
    } else {
      // If not, we update our current entry considering the current object as a property
      currentEntry[currentTag] = currentObj
    }
  })

  // Reads the Disqus backup XML
  if (fs.existsSync) {
    const readStream = fs.createReadStream('disqus.xml')
    readStream.on('data', data => parser.parse(data))
  } else {
    console.error(`The file ${xmlFile} was not found. Please, provide a valid uncompressed XML file.`)
  }
}

// Exports the function if the user decides to use as part of module
module.exports = convertXmlToJson

// Handles the file being called directly
if (require.main === module) {
  const inputFile = process.argv[2] || 'disqus.xml'
  const outputFile = process.argv[3] || 'disqus.json'
  
  convertXmlToJson(inputFile, outputFile)
}