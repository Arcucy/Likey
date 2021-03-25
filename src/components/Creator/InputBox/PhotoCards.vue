<template>
  <div class="album-frame">
    <div class="album-frame-pillar" />
    <div class="album">
      <!-- 单张图片 -->
      <div
        v-if="imgUrls.length === 1"
        class="album-one"
      >
        <span
          class="mdi mdi-close-thick photo-close-btn"
          @click="$emit('remove-file', 0)"
        />
        <el-image
          :src="imgUrls[0]"
          alt="image"
          :preview-src-list="getImgList(0)"
          fit="cover"
          lazy
        />
      </div>
      <!-- 两张图片 -->
      <div
        v-else-if="imgUrls.length === 2"
        class="album-two"
      >
        <div class="album-two-column">
          <span
            class="mdi mdi-close-thick photo-close-btn"
            @click="$emit('remove-file', 0)"
          />
          <el-image
            :src="imgUrls[0]"
            alt="image"
            :preview-src-list="getImgList(0)"
            fit="cover"
            lazy
          />
        </div>
        <div class="album-two-column">
          <span
            class="mdi mdi-close-thick photo-close-btn"
            @click="$emit('remove-file', 1)"
          />
          <el-image
            :src="imgUrls[1]"
            alt="image"
            :preview-src-list="getImgList(1)"
            fit="cover"
            lazy
          />
        </div>
      </div>
      <!-- 三张图片 -->
      <div
        v-else-if="imgUrls.length === 3"
        class="album-three"
      >
        <div class="album-three-column">
          <span
            class="mdi mdi-close-thick photo-close-btn"
            @click="$emit('remove-file', 0)"
          />
          <el-image
            :src="imgUrls[0]"
            alt="image"
            :preview-src-list="getImgList(0)"
            fit="cover"
            lazy
          />
        </div>
        <div class="album-three-column">
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 1)"
            />
            <el-image
              :src="imgUrls[1]"
              alt="image"
              :preview-src-list="getImgList(1)"
              fit="cover"
              lazy
            />
          </div>
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 2)"
            />
            <el-image
              :src="imgUrls[2]"
              alt="image"
              :preview-src-list="getImgList(2)"
              fit="cover"
              lazy
            />
          </div>
        </div>
      </div>
      <!-- 四张图片 -->
      <div
        v-else-if="imgUrls.length === 4"
        class="album-three"
      >
        <div class="album-three-column">
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 0)"
            />
            <el-image
              :src="imgUrls[0]"
              alt="image"
              :preview-src-list="getImgList(0)"
              fit="cover"
              lazy
            />
          </div>
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 2)"
            />
            <el-image
              :src="imgUrls[2]"
              alt="image"
              :preview-src-list="getImgList(2)"
              fit="cover"
              lazy
            />
          </div>
        </div>
        <div class="album-three-column">
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 1)"
            />
            <el-image
              :src="imgUrls[1]"
              alt="image"
              :preview-src-list="getImgList(1)"
              fit="cover"
              lazy
            />
          </div>
          <div class="album-three-column-line">
            <span
              class="mdi mdi-close-thick photo-close-btn"
              @click="$emit('remove-file', 3)"
            />
            <el-image
              :src="imgUrls[3]"
              alt="image"
              :preview-src-list="getImgList(3)"
              fit="cover"
              lazy
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  props: {
    // 卡片数据
    files: {
      type: Array,
      required: true
    }
  },
  computed: {
    imgUrls () {
      try {
        return this.files.map(item => item.url)
      } catch (e) {
        console.error('[Unable to display picture]:', e)
        return []
      }
    }
  },
  methods: {
    getImgList (index) {
      const imgs = [...this.imgUrls]
      imgs.push(...imgs.splice(0, index))
      return imgs
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
.photo-close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  height: 30px;
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #000000c4;
  color: white;
  font-size: 16px;
  z-index: 1;
  cursor: pointer;

  &:hover {
    color: @primary;
    background: #000000c4;
  }
}

.album-frame {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
  user-select: none;

  &-pillar {
    padding-bottom: 56.25%;
  }
}

.album {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 1px solid #ccd6dd;
  background: #f1f1f1;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  color: white;

  .sensitive-filter {
    &.sensitive {
      filter: blur(50px);
      cursor: pointer;
    }
  }

  &-sensitivetab {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: black;
    z-index: 1;
    background: #ffffff80;
    cursor: pointer;
  }

  &-one {
    overflow: hidden;
    width: 100%;
    height: 100%;
    position: relative;
    .sensitive-filter();

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
    .sensitive-filter();

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
    .sensitive-filter();

    .el-image {
      width: 100%;
      height: 100%;
    }
    &-column {
      position: relative;
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
