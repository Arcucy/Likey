<template>
  <div class="album-frame">
    <div class="album-frame-pillar" />
    <div class="album">
      <!-- 单张图片 -->
      <div
        v-if="imgUrls.length === 1"
        class="album-one"
      >
        <Photo
          :src="imgUrls[0]"
          :preview-src-list="getImgList(0)"
        />
      </div>
      <!-- 两张图片 -->
      <div
        v-else-if="imgUrls.length === 2"
        class="album-two"
      >
        <div class="album-two-column">
          <Photo
            :src="imgUrls[0]"
            :preview-src-list="getImgList(0)"
          />
        </div>
        <div class="album-two-column">
          <Photo
            :src="imgUrls[1]"
            :preview-src-list="getImgList(1)"
          />
        </div>
      </div>
      <!-- 三张图片 -->
      <div
        v-else-if="imgUrls.length === 3"
        class="album-three"
      >
        <div class="album-three-column">
          <Photo
            :src="imgUrls[0]"
            :preview-src-list="getImgList(0)"
          />
        </div>
        <div class="album-three-column">
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[1]"
              :preview-src-list="getImgList(1)"
            />
          </div>
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[2]"
              :preview-src-list="getImgList(2)"
            />
          </div>
        </div>
      </div>
      <!-- 四张图片 -->
      <div
        v-else-if="imgUrls.length <= 4"
        class="album-three"
      >
        <div class="album-three-column">
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[0]"
              :preview-src-list="getImgList(0)"
            />
          </div>
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[2]"
              :preview-src-list="getImgList(2)"
            />
          </div>
        </div>
        <div class="album-three-column">
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[1]"
              :preview-src-list="getImgList(1)"
            />
          </div>
          <div class="album-three-column-line">
            <Photo
              :src="imgUrls[3]"
              :preview-src-list="getImgList(3)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Photo from './Photo'

export default {
  components: {
    Photo
  },
  props: {
    // 卡片数据
    media: {
      type: Array,
      required: true
    },
    isEncrypt: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      imageList: []
    }
  },
  computed: {
    imgUrls () {
      try {
        return this.imageList.map(item => item.src)
      } catch (e) {
        console.error('[Unable to display picture]:', e)
        return []
      }
    }
  },
  watch: {
    media: {
      handler (val) {
        if (val) this.initAllImage(val)
      },
      immediate: true
    }
  },
  destroyed () {
    const url = window.URL || window.webkitURL
    this.imgUrls.forEach(item => url.revokeObjectURL(item))
  },
  methods: {
    getImgList (index) {
      const imgs = [...this.imgUrls]
      imgs.push(...imgs.splice(0, index))
      return imgs
    },
    initAllImage (val) {
      this.imageList = []
      val.forEach(async item => {
        const imageObj = {
          id: item.id,
          src: 'loading'
        }
        this.imageList.push(imageObj)
        imageObj.src = await this.getImage(item.id)
      })
    },
    async getImage (address) {
      try {
        const data = await this.$api.gql.getImage(address, this.isEncrypt)
        return data
      } catch (err) {
        console.error(err)
        return ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
.gif-label {
  position: absolute;
  left: 10px;
  top: 10px;
  background: @primary;
  border-radius: 4px;
  font-size: 13px;
  color: white;
  font-weight: 700;
  line-height: 20px;
  height: 20px;
  padding: 0 5px;
  z-index: 1;
}

.album-frame {
  position: relative;
  width: 100%;

  &-pillar {
    padding-bottom: 56.25%;
  }
}

.image-slot {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: @gray3;

  &-icon {
    font-size: 38px;
    height: 42px;
    width: 42px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;
  }
}

.album {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 1px solid @gray2;
  background: @gray1;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  color: @light;

  &-one {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;

    .el-image {
      width: 100%;
      height: 100%;
    }
  }

  &-two {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;

    .el-image {
      width: 100%;
      height: 100%;
    }
    &-column {
      position: relative;
      height: 100%;
      flex: 1;

      &:nth-child(1) {
        margin-right: 2px;
      }
    }

  }

  &-three {
    overflow: hidden;
    width: 100%;
    height: 100%;
    display: flex;

    .el-image {
      width: 100%;
      height: 100%;
    }
    &-column {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      &-line {
        position: relative;
        height: 50%;
        flex: 1;

        &:nth-child(1) {
          margin-bottom: 2px;
        }
      }

      &:nth-child(1) {
        margin-right: 2px;
      }
    }

  }
}
</style>
