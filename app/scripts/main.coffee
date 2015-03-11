new Vue
  el: '#demo'
  data:
    name: "tinone"
  methods:
    greeting: ->
      "Hi #{this.name}"
