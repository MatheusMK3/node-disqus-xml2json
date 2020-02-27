# Disqus XML to JSON

This script was created with the intention of converting the Disqus backup XML file into a JSON that can be read successfully inside Node.js (since any other libraries seemed to crash with very large files ~350MB).

## Installation

You can install it locally by running `npm i disqus-xml2json`, this allows it to run both standalone and as part of your own project.

## Usage

To use it in standalone mode, after installing, simply run `node ./node_modules/disqus-xml2json input-file.xml output-file.json`.

If no filenames are provided, `disqus.xml` and `disqus.json` are used.

To use in your project, simply add `const convert = require('disqus-xml2json')` to your file and then, from your code, run `convert(inputFile, outputFile, callback)`

If you don't want to save the file, just get the list of threads as a raw array, use `convert(inputFile, null, callback)`

## Processing the files

There are examples on how to process the JSON files included, one for general usage and other for WordPress usage.