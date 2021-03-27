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
          <h1>Likey</h1>
          <h2>{{ $t("landing.title") }}</h2>
          <span>{{ $t("landing.description") }}</span>
        </div>
      </div>
      <div class="start-btn-container">
        <button
          @click="$router.push({ name: 'Home' })"
        >
          {{ $t('landing.startbtn') }}
        </button>
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
    max-width: 1200px;

    .canvas-container {
      margin: 60px 0px 60px 0px;
      display: flex;
      align-items: center;
      column-gap: 50px;
      padding: 0 20px;

      &-components {
        display: flex;

        .components {
          display: block;
          height: 600px;
          width: 600px;
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

      button {
        width: 150px;
        height: 50px;
        border-radius: 6px;
        font-size: 16px;
        color: white;
        background-color: @primary;
        border: none;
        outline: none;

        &:hover {
          background-color: #3bb7ec;
        }

        &:active {
          background-color: rgb(47, 102, 139);
        }
      }
    }
  }

  &-background {
    height: calc(100vh - 60px);
    width: 100%;

    img {
      height: 100vh;
      width: 100%;
      object-fit: cover;
    }
  }
}

@media screen and (min-width: 1201px){
  .landing {
    &-canvas {
      .canvas-container {
        &-components {
          .components {
            height: 600px;
            width: 700px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 900px){
  .landing {
    &-canvas {
      .canvas-container {
        &-components {
          .components {
            height: 400px;
            width: 400px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .landing {
    &-canvas {
      .canvas-container {
        display: flex;
        flex-direction: column;

        &-components {
          .components {
            height: 250px;
            width: 400px;
          }
        }

        &-text {
          padding: 0 20px;
          max-width: 600px;
        }
      }
    }
  }
}
</style>
