var buildIndex = require('./index.js')
var treeify = require('treeify').asTree


buildIndex('.', function (err, result) {
  if (err) console.error( err )
  console.log( treeify(result, false) )
})