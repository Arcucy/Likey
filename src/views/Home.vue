<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Button />
    <el-button type="primary" plain>主要按钮</el-button>
  </div>
</template>

<script>
// @ is an alias to /src
import Button from '@/components/Button'

export default {
  name: 'Home',
  components: {
    Button
  }
}
</script>
