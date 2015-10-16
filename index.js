function iriToKey (iri) {
  if (typeof iri === 'string') {
    return iri
  }

  if (typeof iri === 'object' && iri.interfaceName === 'NamedNode') {
    return iri.nominalValue
  }

  // default graph
  if (iri === true) {
    return iri
  }

  // all graphs
  if (!iri) {
    return null
  }

  throw new Error('invalid IRI')
}

function InMemoryStore (options) {
  options = options || {}

  this.rdf = options.rdf || require('rdf-ext')
  this.graphs = {}
}

InMemoryStore.prototype.add = function (iri, graph, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    self.graphs[iri] = self.rdf.createGraph()
    self.graphs[iri].addAll(graph)

    callback(null, graph)
    resolve(graph)
  })
}

InMemoryStore.prototype.delete = function (iri, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    if (iri in self.graphs) {
      delete self.graphs[iri]
    }

    callback()
    resolve()
  })
}

InMemoryStore.prototype.graph = function (iri, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    var graph = null

    if (iri) {
      graph = self.graphs[iri]
    } else {
      graph = self.rdf.createGraph()

      self.forEach(function (toAdd) {
        graph.addAll(toAdd)
      })
    }

    callback(null, graph)
    resolve(graph)
  })
}

InMemoryStore.prototype.match = function (iri, subject, predicate, object, callback, limit) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    self.graph(iri, function (graph) {
      if (!graph) {
        callback()
        resolve()
      } else {
        graph = graph.match(subject, predicate, object, limit)

        callback(null, graph)
        resolve(graph)
      }
    })
  })
}

InMemoryStore.prototype.merge = function (iri, graph, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    if (iri in self.graphs) {
      self.graphs[iri].addAll(graph)
    } else {
      self.graphs[iri] = graph
    }

    callback(null, graph)
    resolve(graph)
  })
}

InMemoryStore.prototype.remove = function (iri, graph, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    if (iri in self.graphs) {
      self.graphs[iri] = self.graphs[iri].difference(graph)
    }

    callback()
    resolve()
  })
}

InMemoryStore.prototype.removeMatches = function (iri, subject, predicate, object, callback) {
  var self = this

  iri = iriToKey(iri)
  callback = callback || function () {}

  return new Promise(function (resolve) {
    if (iri in self.graphs) {
      self.graphs[iri].removeMatches(subject, predicate, object)
    }

    callback()
    resolve()
  })
}

InMemoryStore.prototype.forEach = function (callback) {
  var self = this

  Object.keys(self.graphs).forEach(function (iri) {
    callback(self.graphs[iri], iri)
  })
}

module.exports = InMemoryStore
