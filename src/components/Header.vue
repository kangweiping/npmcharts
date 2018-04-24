<template>
<header class="page-header">
  <div class="heading">
    <a href="/" class="logo">
      <img src="../assets/logo.svg" />
    </a>
    <span class="current-packages">{{ comparePackagesTitle || 'compare npm download trends' }}</span>
  </div>
  <div class="header-controls-wrapper">
    <el-input v-model="packageName" size="mini" placeholder="enter a package name" class="package-name-input" @keydown.native.enter="setPackage"></el-input>
    <el-button size="mini" @click="setPackage" class="btn-set-package">{{ $route.params.packageNames ? 'add' : 'set' }}</el-button>
    <el-checkbox v-model="$store.includeWeekends">include weekends</el-checkbox>
    <!-- <el-button size="mini" @click="setFullScreen" class="btn-full-screen">full screen</el-button> -->
  </div>
</header>
</template>
<script>
import { Input, Checkbox, Button } from 'element-ui'
import store from '../store'

export default {
  data () {
    return {
      comparePackagesTitle: '',
      packageName: ''
    }
  },
  methods: {
    setPackage () {
      let currentPackages = this.$route.params.packageNames
      if (currentPackages) {
        if (this.packageName && currentPackages.split(',').indexOf(this.packageName) === -1) {
          currentPackages += `,${this.packageName}`
        }
      } else {
        currentPackages = this.packageName
      }
      this.$router.push(`/compare/${currentPackages}`)
      this.packageName = ''
    },
    onlyOnePackage (currentPackages) {
      return (currentPackages || this.$route.params.packageNames).indexOf(',') === -1
    },
    setFullScreen () {

    },
    setPackageTitle (currentPackages) {
      if (!currentPackages) {
        this.comparePackagesTitle = ''
      } else if (this.onlyOnePackage()) {
        this.comparePackagesTitle = `${currentPackages} download trends`
      } else {
        this.comparePackagesTitle = `compare ${currentPackages} download trends`
      }
    }
  },
  watch: {
    '$route.path' () {
      this.setPackageTitle(this.$route.params.packageNames)
    }
  },
  components: {
    ElInput: Input,
    ElCheckbox: Checkbox,
    ElButton: Button
  },
  beforeCreate () {
    this.$store = store
  }
}
</script>
<style lang="less">
@headerHeight: 50px;

.page-header {
  padding: 10px;
  background: #f1f1f1;

  .heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 10px;

    .logo img {
      height: @headerHeight;
      margin-right: 20px;
    }

    .current-packages {
      color: #9fb2c2;
    }
  }

  .header-controls-wrapper {
    .btn-set-package {
      margin-right: 20px;
    }

    .btn-full-screen {
      float: right;
    }

    .package-name-input {
      width: 300px;
    }
  }
}

@media screen and (max-width: 600px) {
  .package-name-input {
    width: 180px !important;
  }
}
</style>
