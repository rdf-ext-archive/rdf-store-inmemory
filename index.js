'use strict';

function InMemoryStore (rdf) {
  var graphs = {};

  this.graph = function (iri, callback) {
    var graph = null;

    if (iri === undefined) {
      graph = rdf.createGraph();

      this.forEach(function (toAdd) {
        graph.addAll(toAdd);
      });
    } else if (iri in graphs) {
      graph = graphs[iri];
    }

    callback(null, graph);
  };

  this.match = function (iri, subject, predicate, object, callback, limit) {
    this.graph(iri, function (graph) {
      if (!graph) {
        callback();
      } else {
        callback(null, graph.match(subject, predicate, object, limit));
      }
    });
  };

  this.add = function (iri, graph, callback) {
    graphs[iri] = rdf.createGraph();
    graphs[iri].addAll(graph);

    callback(null, graph);
  };

  this.merge = function (iri, graph, callback) {
    if (iri in graphs) {
      graphs[iri].addAll(graph);
    } else {
      graphs[iri] = graph;
    }

    callback(null, graph);
  };

  this.remove = function (iri, graph, callback) {
    if (iri in graphs) {
      graphs[iri] = rdf.Graph.difference(graphs[iri], graph);
    }

    callback();
  };

  this.removeMatches = function (iri, subject, predicate, object, callback) {
    if (iri in graphs) {
      graphs[iri].removeMatches(subject, predicate, object);
    }

    callback();
  };

  this.delete = function (iri, callback) {
    if (iri in graphs) {
      delete graphs[iri];
    }

    callback();
  };

  this.forEach = function (callback) {
    Object.keys(graphs).forEach(function (iri) {
      callback(graphs[iri], iri);
    });
  };
};

module.exports = InMemoryStore;