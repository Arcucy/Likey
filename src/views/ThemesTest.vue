<template>
  <Layout>
    <div class="themes-test">
      <h1>Themes Test</h1>
      <div class="themes-test-list">
        <div class="themes themes-test-item" v-for="(color, index) of colors" :key="index">
          <div class="themes-color-cube" :class="'themes-' + color.label" @click="copyCode('@' + color.label)"/>
          <h4>@{{ color.label }}</h4>
          <p>{{ color.desp }}</p>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script>
import Layout from '@/components/Layout'

export default {
  name: 'ThemesTest',
  components: {
    Layout
  },
  data () {
    return {
      colors: [
        {
          label: 'background',
          desp: '背景色'
        },
        {
          label: 'background-dark',
          desp: '背景色（加深）'
        },
        {
          label: 'primary',
          desp: '主要颜色'
        },
        {
          label: 'primary-light',
          desp: '主色偏白'
        },
        {
          label: 'primary-dark',
          desp: '主色较白'
        },
        {
          label: 'secondary',
          desp: '次要颜色'
        },
        {
          label: 'secondary-light',
          desp: '次色偏白'
        },
        {
          label: 'secondary-dark',
          desp: '次色较白'
        },
        {
          label: 'light',
          desp: '亮色（可以用于文字/图标）'
        },
        {
          label: 'dark',
          desp: '暗色（可以用于文字/图标）'
        },
        {
          label: 'gray1',
          desp: '灰色（升序，逐渐加深）'
        },
        {
          label: 'gray2',
          desp: '灰色（升序，逐渐加深）'
        },
        {
          label: 'gray3',
          desp: '灰色（升序，逐渐加深）'
        },
        {
          label: 'gray4',
          desp: '灰色（升序，逐渐加深）'
        },
        {
          label: 'gray5',
          desp: '灰色（升序，逐渐加深）'
        }
      ]
    }
  },
  methods: {
    // 拷贝
    copyCode (code) {
      console.log(code)
      this.$copyText(code).then(
        () => {
          this.$message({
            showClose: true,
            message: this.$t('success.copy'),
            type: 'success'
          })
        },
        () => {
          this.$message({ showClose: true, message: this.$t('error.copy'), type: 'error' })
        }
      )
    }
  }
}
</script>

<style lang="less" scoped>
.themes-test {
  box-sizing: border-box;
  margin: 40px auto;
  max-width: 1220px;
  padding: 0 10px;
  width: 100%;
  h1 {
    text-align: center;
  }

  &-list {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
    grid-gap: 10px 10px;
    justify-content: space-between;
  }
  &-item {
    width: 100%;

    h4 {
      text-align: center;
    }
    p {
      text-align: center;
      font-size: 14;
      color: @gray4;
    }
  }
}
.themes-color-cube {
  height: 100px;
  box-shadow: 0 0 2px 0 #0000001a;
  transform: translateY(0px);
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    box-shadow: 0 2px 15px 0 #00000033;
    transform: translateY(-4px);
  }
}

.themes {
  &-background {
    background-color: @background;
  }
  &-background-dark {
    background-color: @background-dark;
  }
  &-primary {
    background-color: @primary;
  }
  &-primary-light {
    background-color: @primary-light;
  }
  &-primary-dark {
    background-color: @primary-dark;
  }
  &-secondary {
    background-color: @secondary;
  }
  &-secondary-light {
    background-color: @secondary-light;
  }
  &-secondary-dark {
    background-color: @secondary-dark;
  }
  &-light {
    background-color: @light;
  }
  &-dark {
    background-color: @dark;
  }
  &-gray1 {
    background-color: @gray1;
  }
  &-gray2 {
    background-color: @gray2;
  }
  &-gray3 {
    background-color: @gray3;
  }
  &-gray4 {
    background-color: @gray4;
  }
  &-gray5 {
    background-color: @gray5;
  }
}
</style>
