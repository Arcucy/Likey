<template>
  <div class="landing">
    <div class="landing-background">
      <img :src="bg">
    </div>
    <div class="landing-canvas">
      <div class="canvas-container">
        <div class="canvas-container-components">
          <svg-icon class="components" icon-class="components" />
        </div>
        <div class="canvas-container-text">
          <h1>Growth</h1>
          <h2>{{ $t("landing.title") }}</h2>
          <span>{{ $t("landing.description") }}</span>
        </div>
      </div>
      <div class="start-btn-container">
        <el-button
          type="primary"
          class="start-btn"
          round
          @click="$router.push({ path: '/home' })"
        >
          {{ $t('landing.startbtn') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import bg from '@/assets/img/landing_background.png'

export default {
  data () {
    return {
      bg
    }
  }
}
</script>

<style lang="less" scoped>
.landing {
  width: 100%;
  overflow: hidden;
  background-color: #292f36;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &-canvas {
    display: flex;
    position: absolute;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 30px;

    .canvas-container {
      margin: 60px 0px 60px 0px;
      display: flex;
      align-items: center;
      column-gap: 50px;

      &-components {
        display: flex;

        .components {
          display: block;
          height: 50vh;
          width: 50vw;
        }
      }

      &-text {
        color: white;
        max-width: 300px;
        line-height: 25px;
      }
    }

    .start-btn-container {
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
    }
  }

  &-background {
    height: calc(100vh - 60px);
    width: 100%;
  }
}

@media screen and (max-width: 640px) {
  .landing {
    &-canvas {
      .canvas-container {
        display: flex;
        flex-direction: column;

        &-components {
          .components {
            height: auto;
          }
        }
      }
    }
  }
}
</style>
