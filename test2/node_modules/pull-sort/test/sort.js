var test = require('tape')
var sort = require('../')
var pull = require('pull-stream')

test('Should sort a stream of values', function(t) {
  pull(
    pull.values([7,3,5,2]),
    sort( function(a, b) {return b - a} ),
    pull.collect( function(err, values) {
      for(var i=0; i<values.length; ++i) {
        t.equal(values[i], [7, 5, 3, 2][i])
      }
      t.end()
    })
  )
})

