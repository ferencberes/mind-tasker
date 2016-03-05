var couchbase = require('couchbase');

console.log('Alma korte szilva!')

var cluster = new couchbase.Cluster('couchbase://127.0.0.1');
var bucket = cluster.openBucket('default');

bucket.upsert('testdoc', {name:'Frank'}, function(err, result) {
  if (err) throw err;

  bucket.get('testdoc', function(err, result) {
    if (err) throw err;

    console.log(result.value);
    // {name: Frank}
  });
});

//bucket.disconnect();