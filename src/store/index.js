import Vue from 'vue'

export default new Vue({
  data: {
    // currentPackages: '',
    includeWeekends: false
  },
  methods: {
    onlyOnePackage (currentPackages) {
      return (currentPackages || this.currentPackages).indexOf(',') === -1
    }
  }
})
