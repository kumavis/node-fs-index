var fs = require('fs')
var path = require('path')
var async = require('async')
var bind = require('ap').partial

module.exports = buildIndex


function buildIndex(opts, callback) {
  var rootPath = opts.rootPath
  var rootDirObj = new Directory()
  updateDir({ dirPath: rootPath, dirObj: rootDirObj }, callback)
}

function updateDir(opts, callback) {
  var dirPath = opts.dirPath
  var dirObj = opts.dirObj
  var watchDirs = opts.watchDirs
  var watchFiles = opts.watchFiles
  
  fs.readdir(dirPath, function(readError, entityNameList) {

    // if there was an error, this is undefined
    // this allows us to gracefully skip processing the entities
    entityNameList = entityNameList || []

    // keep track of any errors during this process
    var error = readError

    var entityPathList = entityNameList.map(function(entityName) {
      return path.join(dirPath, entityName)
    })

    // walk through all entities
    async.map(entityPathList, fs.stat, function(statError, statList) {

      // keep track of any errors during this process
      error = error || statError

      // add files + dirs to directoryObject,
      // filter out subdirs for recursive updates
      var subDirs = []

      statList.map(function(stats, index) {
        
        var entryName = entityNameList[index]
        var entryPath = path.join(dirPath, entryName)

        if ( stats.isDirectory() ) {
          
          var newDir = new Directory()
          dirObj[entryName] = newDir
          subDirs.push({
            dirPath: entryPath,
            dirObj: newDir,
          })

        } else if ( stats.isFile() ) {
          
          // dirObj[entryName] = stats
          dirObj[entryName] = true

        } else if ( stats.isBlockDevice() ) {

          dirObj[entryName] = true

        } else if ( stats.isCharacterDevice() ) {

          dirObj[entryName] = true

        } else if ( stats.isSymbolicLink() ) {

          dirObj[entryName] = true

        } else if ( stats.isFIFO() ) {

          dirObj[entryName] = true

        } else if ( stats.isSocket() ) {

          dirObj[entryName] = true

        } else {
          throw new Error('unknown fs entity type: '+stats.type)
        }
          
      })

      // recursively update subdirs
      async.map(subDirs, updateDir, bind(callback, error, dirObj))

    })

  })
}

function Directory(opts) {}