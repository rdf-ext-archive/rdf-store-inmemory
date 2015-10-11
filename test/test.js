/* global describe, it */
var assert = require('assert')
var rdf = require('rdf-ext')
var InMemoryStore = require('../')

describe('rdf-store-inmemory', function () {
  it('should implement the Store interface', function () {
    var store = new InMemoryStore()

    assert.equal(typeof store, 'object')
    assert.equal(typeof store.add, 'function')
    assert.equal(typeof store.delete, 'function')
    assert.equal(typeof store.graph, 'function')
    assert.equal(typeof store.match, 'function')
    assert.equal(typeof store.merge, 'function')
    assert.equal(typeof store.remove, 'function')
    assert.equal(typeof store.removeMatches, 'function')
  })

  it('.add should add a graph to the store with callback interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph(), function (err, graph) {
      assert.equal(err, null)
      assert.equal(graph.length, 0)
      assert.equal(Object.keys(store.graphs).length, 1)

      done()
    })
  })

  it('.add should add a graph to the store with Promise interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph()).then(function (graph) {
      assert.equal(graph.length, 0)
      assert.equal(Object.keys(store.graphs).length, 1)

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.delete should delete a graph from the store with callback interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph(), function () {
      store.delete('http://example.org/graph', function (err) {
        assert.equal(err, null)
        assert.equal(Object.keys(store.graphs), 0)

        done()
      })
    })
  })

  it('.delete should delete a graph from the store with Promise interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph()).then(function () {
      return store.delete('http://example.org/graph')
    }).then(function () {
      assert.equal(Object.keys(store.graphs), 0)

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.graph should return the named graph with callback interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph(), function () {
      store.graph('http://example.org/graph', function (err, graph) {
        assert.equal(err, null)
        assert.equal(graph.length, 0)

        done()
      })
    })
  })

  it('.graph should return the named graph with Promise interface', function (done) {
    var store = new InMemoryStore()

    store.add('http://example.org/graph', rdf.createGraph()).then(function () {
      return store.graph('http://example.org/graph')
    }).then(function (graph) {
      assert.equal(graph.length, 0)

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.graph should return null if it does not contain the named graph', function (done) {
    var store = new InMemoryStore()

    store.graph('http://example.org/graph').then(function (graph) {
      assert.equal(graph, null)

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.graph should use true to access the default graph', function (done) {
    var store = new InMemoryStore()
    var defaultGraph = rdf.createGraph([
      rdf.createTriple(
        rdf.createNamedNode('http://example.org/subject'),
        rdf.createNamedNode('http://example.org/predicate'),
        rdf.createLiteral('default')
      )
    ])
    var otherGraph = rdf.createGraph([
      rdf.createTriple(
        rdf.createNamedNode('http://example.org/subject'),
        rdf.createNamedNode('http://example.org/predicate'),
        rdf.createLiteral('other')
      )
    ])

    Promise.all([
      store.add(true, defaultGraph),
      store.add('http://example.org/graph', otherGraph)
    ]).then(function () {
      return store.graph(true)
    }).then(function (graph) {
      assert.equal(graph.length, 1)
      assert(graph.toArray().shift().object.equals('default'))

      done()
    }).catch(function (error) {
      done(error)
    })
  })

  it('.graph should use null to access all graphs', function (done) {
    var store = new InMemoryStore()
    var defaultGraph = rdf.createGraph([
      rdf.createTriple(
        rdf.createNamedNode('http://example.org/subject'),
        rdf.createNamedNode('http://example.org/predicate'),
        rdf.createLiteral('default')
      )
    ])
    var otherGraph = rdf.createGraph([
      rdf.createTriple(
        rdf.createNamedNode('http://example.org/subject'),
        rdf.createNamedNode('http://example.org/predicate'),
        rdf.createLiteral('other')
      )
    ])

    Promise.all([
      store.add(true, defaultGraph),
      store.add('http://example.org/graph', otherGraph)
    ]).then(function () {
      return store.graph()
    }).then(function (graph) {
      assert.equal(graph.length, 2)

      done()
    }).catch(function (error) {
      done(error)
    })
  })
})
