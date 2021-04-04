<template>
  <div class="setting-header">
    <router-link
      v-for="(tab, index) of tabs"
      :key="index"
      :class="tab.name === $route.name && 'active'"
      :to="{ name: tab.name }"
    >
      {{ $t(tab.label) }}
    </router-link>
  </div>
</template>

<script>

export default {
  name: 'Home',
  components: {
  },
  data () {
    return {
      tabs: [
        {
          name: 'Setting-Creator',
          label: 'setting.creatorSetting'
        },
        {
          name: 'Setting-Token',
          label: 'setting.tokenSettings'
        }
      ]
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
.setting-header {
  display: flex;
  margin: 0 0 20px;
  a {
    color: @gray3;
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;

    margin-right: 20px;
    &:last-child {
      margin-right: 0;
    }

    &:hover {
      color: @primary;
    }
    &.active {
      color: @dark;
      cursor: default;
    }
  }
}
</style>
